import os
import asyncpg
from typing import List, Optional, Dict, Any
import json
import uuid
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseService:
    def __init__(self):
        self.connection_string = None
        
    def _get_connection_string(self):
        """Get database connection string with lazy initialization"""
        if self.connection_string is None:
            self.connection_string = os.getenv("DATABASE_URL")
            if not self.connection_string:
                raise ValueError("DATABASE_URL environment variable is required")
            
            # Skip validation for Supabase URLs and mock mode
            if (self.connection_string.startswith("postgresql://") or 
                self.connection_string.startswith("postgres://") or
                self.connection_string == "mock://localhost"):
                return self.connection_string
            
            # Only show error for obviously placeholder values
            if (self.connection_string.startswith("your_supabase") or 
                "placeholder" in self.connection_string.lower() or
                self.connection_string == "your_database_url_here"):
                raise ValueError("DATABASE_URL contains placeholder values. Please update .env file with actual database connection string.")
                
        return self.connection_string
    
    def _is_mock_mode(self):
        """Check if running in mock mode"""
        connection_string = self._get_connection_string()
        return connection_string == "mock://localhost"
    
    async def get_connection(self):
        """Get database connection"""
        connection_string = self._get_connection_string()
        if connection_string == "mock://localhost":
            raise ValueError("Database in mock mode - no real database operations available")
        
        try:
            logger.info("🔗 Attempting to connect to database...")
            conn = await asyncpg.connect(connection_string)
            logger.info("✅ Database connection successful")
            return conn
        except asyncpg.InvalidCatalogNameError as e:
            logger.error(f"❌ Database does not exist: {e}")
            raise ValueError(f"Database does not exist. Please check your DATABASE_URL: {e}")
        except asyncpg.InvalidPasswordError as e:
            logger.error(f"❌ Invalid database credentials: {e}")
            raise ValueError(f"Invalid database credentials. Please check your DATABASE_URL: {e}")
        except asyncpg.ConnectionFailureError as e:
            logger.error(f"❌ Cannot connect to database server: {e}")
            raise ValueError(f"Cannot connect to database server. Please check your DATABASE_URL and network: {e}")
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise ValueError(f"Database connection failed: {e}")
    
    async def register_user(self, name: str, face_api_descriptor: List[float], 
                          arcface_descriptor: List[float], enrollment_images: List[str]) -> str:
        """Register a new user with both face descriptors"""
        conn = await self.get_connection()
        try:
            user_id = str(uuid.uuid4())
            
            await conn.execute("""
                INSERT INTO known_faces (id, name, face_api_descriptor, arcface_descriptor, enrollment_images)
                VALUES ($1, $2, $3, $4, $5)
            """, user_id, name, face_api_descriptor, arcface_descriptor, json.dumps(enrollment_images))
            
            return user_id
        finally:
            await conn.close()
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        conn = await self.get_connection()
        try:
            row = await conn.fetchrow("""
                SELECT id, name, face_api_descriptor, arcface_descriptor, enrollment_images
                FROM known_faces WHERE id = $1
            """, user_id)
            
            if row:
                return {
                    'id': row['id'],
                    'name': row['name'],
                    'face_api_descriptor': row['face_api_descriptor'],
                    'arcface_descriptor': row['arcface_descriptor'],
                    'enrollment_images': json.loads(row['enrollment_images'])
                }
            return None
        finally:
            await conn.close()
    
    async def get_all_users(self) -> List[Dict[str, Any]]:
        """Get all registered users"""
        if self._is_mock_mode():
            # Return mock data for testing
            return [
                {
                    'id': 'mock-user-1',
                    'name': 'Test User 1',
                    'face_api_descriptor': [0.1] * 128,
                    'arcface_descriptor': [0.2] * 512,
                    'enrollment_images': []
                },
                {
                    'id': 'mock-user-2', 
                    'name': 'Test User 2',
                    'face_api_descriptor': [0.3] * 128,
                    'arcface_descriptor': [0.4] * 512,
                    'enrollment_images': []
                }
            ]
        
        conn = await self.get_connection()
        try:
            rows = await conn.fetch("""
                SELECT id, name, face_api_descriptor, arcface_descriptor, enrollment_images
                FROM known_faces
            """)
            
            users = []
            for row in rows:
                users.append({
                    'id': row['id'],
                    'name': row['name'],
                    'face_api_descriptor': row['face_api_descriptor'],
                    'arcface_descriptor': row['arcface_descriptor'],
                    'enrollment_images': json.loads(row['enrollment_images'])
                })
            
            return users
        finally:
            await conn.close()
    
    async def save_attendance(self, user_id: str, similarity: float, latency_ms: float, model: str):
        """Save attendance record"""
        conn = await self.get_connection()
        try:
            await conn.execute("""
                INSERT INTO attendance (user_id, similarity, latency_ms, model, created_at)
                VALUES ($1, $2, $3, $4, $5)
            """, user_id, similarity, latency_ms, model, datetime.now())
        finally:
            await conn.close()
    
    async def save_benchmark_result(self, user_id: str, face_api_accuracy: Optional[float],
                                  face_api_latency: Optional[float], arcface_accuracy: Optional[float],
                                  arcface_latency: Optional[float], test_image: str):
        """Save benchmark result"""
        conn = await self.get_connection()
        try:
            await conn.execute("""
                INSERT INTO benchmark_results (user_id, face_api_accuracy, face_api_latency,
                                             arcface_accuracy, arcface_latency, test_image, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            """, user_id, face_api_accuracy, face_api_latency, arcface_accuracy, 
                arcface_latency, test_image, datetime.now())
        finally:
            await conn.close()
    
    async def get_benchmark_results(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get benchmark results"""
        conn = await self.get_connection()
        try:
            rows = await conn.fetch("""
                SELECT br.*, kf.name as user_name
                FROM benchmark_results br
                JOIN known_faces kf ON br.user_id = kf.id
                ORDER BY br.created_at DESC
                LIMIT $1
            """, limit)
            
            results = []
            for row in rows:
                results.append({
                    'id': row['id'],
                    'user_id': row['user_id'],
                    'user_name': row['user_name'],
                    'face_api_accuracy': row['face_api_accuracy'],
                    'face_api_latency': row['face_api_latency'],
                    'arcface_accuracy': row['arcface_accuracy'],
                    'arcface_latency': row['arcface_latency'],
                    'created_at': row['created_at'].isoformat()
                })
            
            return results
        finally:
            await conn.close()

    async def update_user_arcface_descriptor(self, user_id: str, arcface_descriptor: List[float]):
        """Update user with ArcFace descriptor"""
        conn = await self.get_connection()
        try:
            await conn.execute("""
                UPDATE known_faces 
                SET arcface_descriptor = $1 
                WHERE id = $2
            """, json.dumps(arcface_descriptor), user_id)
        finally:
            await conn.close()

# Global instance
db_service = DatabaseService()
