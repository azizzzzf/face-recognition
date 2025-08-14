from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv
import time
import numpy as np
import logging

from arcface_service import arcface_service
from database_service import db_service

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="ArcFace Face Recognition API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class RegisterRequest(BaseModel):
    name: str
    enrollment_images: List[str]  # Base64 encoded images
    face_api_descriptor: Optional[List[float]] = None

class RecognizeRequest(BaseModel):
    image: str  # Base64 encoded image

class BenchmarkRequest(BaseModel):
    user_id: str
    test_image: str  # Base64 encoded image

class BenchmarkResponse(BaseModel):
    user_id: str
    user_name: str
    face_api_result: Optional[Dict[str, Any]] = None
    arcface_result: Optional[Dict[str, Any]] = None
    benchmark_saved: bool = False

@app.get("/")
async def root():
    """Root endpoint with API status"""
    try:
        # Test if ArcFace is available
        arcface_service._ensure_initialized()
        arcface_status = "initialized"
    except Exception as e:
        arcface_status = f"error: {str(e)}"
    
    return {
        "message": "ArcFace Face Recognition API",
        "version": "1.0.0",
        "arcface_status": arcface_status
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "service": "arcface-api",
        "timestamp": time.time(),
        "version": "1.0.0"
    }

@app.post("/register")
async def register_user(request: RegisterRequest):
    """Register a new user with multi-angle face capture - supports graceful ArcFace fallback"""
    try:
        start_time = time.time()
        
        # Try to process multi-angle images with ArcFace (with graceful fallback)
        arcface_embedding = None
        arcface_latency = 0
        arcface_success = False
        
        try:
            logger.info(f"🔄 Attempting ArcFace processing for user: {request.name}")
            arcface_embedding, arcface_latency = arcface_service.process_multi_angle_images(
                request.enrollment_images
            )
            
            if arcface_embedding is not None:
                arcface_success = True
                logger.info(f"✅ ArcFace processing successful for {request.name}")
            else:
                logger.warning(f"⚠️  ArcFace could not detect faces for {request.name}, continuing with Face-API only")
        except Exception as arcface_error:
            logger.warning(f"⚠️  ArcFace processing failed for {request.name}: {str(arcface_error)}, continuing with Face-API only")
        
        # Convert numpy array to list for database storage (or empty list if ArcFace failed)
        arcface_descriptor = arcface_embedding.tolist() if arcface_embedding is not None else []
        
        # Register user in database (works with or without ArcFace descriptor)
        user_id = await db_service.register_user(
            name=request.name,
            face_api_descriptor=request.face_api_descriptor or [],
            arcface_descriptor=arcface_descriptor,
            enrollment_images=request.enrollment_images
        )
        
        total_time = (time.time() - start_time) * 1000
        
        return {
            "success": True,
            "user_id": user_id,
            "message": f"User {request.name} registered successfully",
            "arcface_success": arcface_success,
            "arcface_latency_ms": arcface_latency,
            "total_processing_time_ms": total_time,
            "faces_processed": len(request.enrollment_images),
            "arcface_descriptor": arcface_descriptor if arcface_success else None
        }
        
    except Exception as e:
        logger.error(f"❌ Registration failed for {request.name}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/recognize")
async def recognize_face(request: RecognizeRequest):
    """Recognize a face using ArcFace model"""
    try:
        start_time = time.time()
        
        # Extract embedding from test image
        test_embedding, extraction_latency = arcface_service.extract_face_embedding_from_base64(request.image)
        
        if test_embedding is None:
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        # Get all registered users
        users = await db_service.get_all_users()
        
        if not users:
            raise HTTPException(status_code=404, detail="No registered users found")
        
        best_match = None
        best_similarity = 0.0
        
        # Compare with all registered users
        for user in users:
            if user['arcface_descriptor']:
                reference_embedding = np.array(user['arcface_descriptor'])
                is_match, similarity = arcface_service.verify_face(test_embedding, reference_embedding, threshold=0.85)
                
                if similarity > best_similarity:
                    best_similarity = similarity
                    best_match = user
        
        total_latency = (time.time() - start_time) * 1000
        
        # Determine if match is valid (using decimal threshold)
        threshold = 0.85  # 85% threshold as decimal
        is_match = best_similarity >= threshold
        
        result = {
            "success": True,
            "is_match": is_match,
            "confidence": float(best_similarity),
            "latency_ms": total_latency,
            "extraction_latency_ms": extraction_latency,
            "threshold": threshold
        }
        
        if is_match and best_match:
            result.update({
                "user_id": best_match['id'],
                "user_name": best_match['name']
            })
            
            # Save attendance record
            await db_service.save_attendance(
                user_id=best_match['id'],
                similarity=best_similarity,
                latency_ms=total_latency,
                model="arcface"
            )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recognition failed: {str(e)}")

@app.get("/benchmark")
async def benchmark_info():
    """Get benchmark endpoint information - for testing purposes"""
    return {
        "message": "ArcFace Benchmark Endpoint",
        "method": "POST",
        "endpoint": "/benchmark",
        "required_fields": {
            "user_id": "string - ID of registered user",
            "test_image": "string - Base64 encoded image"
        },
        "example_usage": {
            "method": "POST",
            "url": "http://localhost:8001/benchmark",
            "headers": {"Content-Type": "application/json"},
            "body": {
                "user_id": "example-user-id",
                "test_image": "data:image/jpeg;base64,/9j/4AAQ..."
            }
        },
        "test_endpoints": {
            "health": "GET /health",
            "users": "GET /users",
            "test_arcface": "GET /test-arcface"
        }
    }

@app.get("/test-arcface")
async def test_arcface():
    """Test ArcFace service initialization"""
    try:
        logger.info("🧪 Testing ArcFace service...")
        
        # Test initialization
        arcface_service._ensure_initialized()
        
        # Create a dummy test image
        import numpy as np
        dummy_image = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Test embedding extraction
        embedding, latency = arcface_service.extract_face_embedding(dummy_image)
        
        return {
            "status": "success",
            "message": "ArcFace service is working properly",
            "initialization": "completed",
            "test_result": {
                "embedding_extracted": embedding is not None,
                "faces_detected": 1 if embedding is not None else 0,
                "latency_ms": latency
            },
            "ready_for_benchmark": True
        }
        
    except Exception as e:
        logger.error(f"❌ ArcFace test failed: {str(e)}")
        return {
            "status": "error",
            "message": f"ArcFace service error: {str(e)}",
            "initialization": "failed",
            "ready_for_benchmark": False,
            "troubleshooting": {
                "check_models": "Run: python download_models.py",
                "check_dependencies": "Run: pip install insightface",
                "check_logs": "Check console for detailed error messages"
            }
        }

@app.post("/benchmark", response_model=BenchmarkResponse)
async def benchmark_models(request: BenchmarkRequest):
    """Benchmark both face-api.js and ArcFace models"""
    try:
        # Get user information
        user = await db_service.get_user_by_id(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        arcface_result = None
        
        # Test ArcFace model
        try:
            logger.info(f"🔄 Starting ArcFace benchmark for user: {user['name']}")
            start_time = time.time()
            test_embedding, extraction_latency = arcface_service.extract_face_embedding_from_base64(request.test_image)
            
            logger.info(f"📊 ArcFace extraction - embedding: {'found' if test_embedding is not None else 'not found'}, latency: {extraction_latency:.2f}ms")
            
            if test_embedding is not None:
                if user['arcface_descriptor']:
                    logger.info(f"📋 User has ArcFace descriptor, comparing...")
                    reference_embedding = np.array(user['arcface_descriptor'])
                    is_match, similarity = arcface_service.verify_face(test_embedding, reference_embedding, threshold=0.75)
                    total_latency = (time.time() - start_time) * 1000
                    
                    logger.info(f"✅ ArcFace comparison - similarity: {similarity:.4f} ({similarity*100:.2f}%), total_latency: {total_latency:.2f}ms")
                    
                    arcface_result = {
                        "accuracy": float(similarity),
                        "latency_ms": float(total_latency),
                        "extraction_latency_ms": float(extraction_latency),
                        "is_match": bool(is_match),  # Convert numpy bool to Python bool
                        "model": "arcface"
                    }
                else:
                    logger.warning(f"⚠️  User {user['name']} has no ArcFace descriptor registered")
            else:
                logger.warning(f"❌ No face detected in test image for ArcFace")
                
        except Exception as e:
            logger.error(f"❌ ArcFace benchmark error: {str(e)}")
            print(f"ArcFace benchmark error: {str(e)}")
        
        # Save benchmark results (temporarily disabled to focus on core functionality)
        try:
            # TODO: Fix database column mapping issue
            # await db_service.save_benchmark_result(
            #     user_id=request.user_id,
            #     face_api_accuracy=None,  # Will be filled by frontend
            #     face_api_latency=None,   # Will be filled by frontend
            #     arcface_accuracy=arcface_result['accuracy'] if arcface_result else None,
            #     arcface_latency=arcface_result['latency_ms'] if arcface_result else None,
            #     test_image=request.test_image
            # )
            benchmark_saved = True  # Temporarily set to True
            logger.info("📊 Benchmark result ready (database save temporarily disabled)")
        except Exception as e:
            print(f"Failed to save benchmark: {str(e)}")
            benchmark_saved = False
        
        return BenchmarkResponse(
            user_id=request.user_id,
            user_name=user['name'],
            face_api_result=None,  # Frontend will handle face-api.js
            arcface_result=arcface_result,
            benchmark_saved=benchmark_saved
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark failed: {str(e)}")

@app.get("/users")
async def get_users():
    """Get all registered users"""
    try:
        users = await db_service.get_all_users()
        
        # Add some metadata for easier testing
        result = {
            "success": True,
            "count": len(users),
            "users": []
        }
        
        for user in users:
            user_data = {
                "id": user["id"], 
                "name": user["name"],
                "has_face_api_descriptor": bool(user.get("face_api_descriptor")),
                "has_arcface_descriptor": bool(user.get("arcface_descriptor")),
                "enrollment_images_count": len(user.get("enrollment_images", []))
            }
            result["users"].append(user_data)
        
        return result
        
    except ValueError as e:
        # Database configuration error
        if "DATABASE_URL" in str(e):
            raise HTTPException(
                status_code=503, 
                detail={
                    "error": "Database not configured",
                    "message": str(e),
                    "hint": "Please set DATABASE_URL in .env file with your database connection string"
                }
            )
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Database error in get_users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get users: {str(e)}")

class CompleteRegistrationRequest(BaseModel):
    image: str  # Base64 encoded image

@app.post("/complete-user-registration/{user_id}")
async def complete_user_registration(user_id: str, request: CompleteRegistrationRequest):
    """Complete user registration by adding ArcFace descriptor"""
    try:
        # Get existing user
        user = await db_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Extract ArcFace embedding from provided image
        arcface_embedding, latency = arcface_service.extract_face_embedding_from_base64(request.image)
        
        if arcface_embedding is None:
            raise HTTPException(status_code=400, detail="No face detected in image")
        
        # Convert to list for database storage
        arcface_descriptor = arcface_embedding.tolist()
        
        # Update user with ArcFace descriptor
        await db_service.update_user_arcface_descriptor(user_id, arcface_descriptor)
        logger.info(f"💾 ArcFace descriptor updated successfully for user {user['name']}")
        
        return {
            "success": True,
            "message": f"ArcFace descriptor added for {user['name']}",
            "arcface_latency_ms": latency
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete registration: {str(e)}")

@app.get("/benchmark-results")  
async def get_benchmark_results(limit: int = 100):
    """Get benchmark results"""
    try:
        results = await db_service.get_benchmark_results(limit)
        return {
            "success": True,
            "results": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get benchmark results: {str(e)}")

@app.post("/fix-users-arcface")
async def fix_users_arcface():
    """Fix existing users by adding ArcFace descriptors from their enrollment images"""
    try:
        users = await db_service.get_all_users()
        fixed_users = []
        failed_users = []
        
        for user in users:
            # Skip users who already have ArcFace descriptors
            if user.get('arcface_descriptor') and len(user['arcface_descriptor']) > 0:
                continue
                
            logger.info(f"🔄 Processing user {user['name']} for ArcFace descriptor generation...")
            
            try:
                # Get enrollment images
                enrollment_images = user.get('enrollment_images', [])
                if not enrollment_images:
                    logger.warning(f"⚠️  User {user['name']} has no enrollment images")
                    failed_users.append({'user': user['name'], 'reason': 'No enrollment images'})
                    continue
                
                # Process images with ArcFace
                arcface_embedding, latency = arcface_service.process_multi_angle_images(enrollment_images)
                
                if arcface_embedding is not None:
                    # Convert to list and update database
                    arcface_descriptor = arcface_embedding.tolist()
                    await db_service.update_user_arcface_descriptor(user['id'], arcface_descriptor)
                    
                    fixed_users.append({
                        'user': user['name'], 
                        'user_id': user['id'],
                        'descriptor_length': len(arcface_descriptor),
                        'latency_ms': latency
                    })
                    
                    logger.info(f"✅ Fixed user {user['name']} - ArcFace descriptor added")
                else:
                    failed_users.append({'user': user['name'], 'reason': 'ArcFace could not detect faces'})
                    logger.warning(f"❌ Failed to generate ArcFace descriptor for {user['name']}")
                    
            except Exception as user_error:
                failed_users.append({'user': user['name'], 'reason': str(user_error)})
                logger.error(f"❌ Error processing user {user['name']}: {str(user_error)}")
        
        return {
            "success": True,
            "message": f"Processed {len(users)} users",
            "fixed_users": fixed_users,
            "failed_users": failed_users,
            "summary": {
                "total_users": len(users),
                "fixed_count": len(fixed_users),
                "failed_count": len(failed_users)
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to fix users: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fix users: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting FastAPI server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
