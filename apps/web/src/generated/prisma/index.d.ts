
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model KnownFace
 * 
 */
export type KnownFace = $Result.DefaultSelection<Prisma.$KnownFacePayload>
/**
 * Model Attendance
 * 
 */
export type Attendance = $Result.DefaultSelection<Prisma.$AttendancePayload>
/**
 * Model BenchmarkResult
 * 
 */
export type BenchmarkResult = $Result.DefaultSelection<Prisma.$BenchmarkResultPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more KnownFaces
 * const knownFaces = await prisma.knownFace.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more KnownFaces
   * const knownFaces = await prisma.knownFace.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.knownFace`: Exposes CRUD operations for the **KnownFace** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more KnownFaces
    * const knownFaces = await prisma.knownFace.findMany()
    * ```
    */
  get knownFace(): Prisma.KnownFaceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.attendance`: Exposes CRUD operations for the **Attendance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Attendances
    * const attendances = await prisma.attendance.findMany()
    * ```
    */
  get attendance(): Prisma.AttendanceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.benchmarkResult`: Exposes CRUD operations for the **BenchmarkResult** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more BenchmarkResults
    * const benchmarkResults = await prisma.benchmarkResult.findMany()
    * ```
    */
  get benchmarkResult(): Prisma.BenchmarkResultDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.8.1
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    KnownFace: 'KnownFace',
    Attendance: 'Attendance',
    BenchmarkResult: 'BenchmarkResult'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "knownFace" | "attendance" | "benchmarkResult"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      KnownFace: {
        payload: Prisma.$KnownFacePayload<ExtArgs>
        fields: Prisma.KnownFaceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.KnownFaceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnownFacePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.KnownFaceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnownFacePayload>
          }
          findFirst: {
            args: Prisma.KnownFaceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnownFacePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.KnownFaceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnownFacePayload>
          }
          findMany: {
            args: Prisma.KnownFaceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnownFacePayload>[]
          }
          create: {
            args: Prisma.KnownFaceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnownFacePayload>
          }
          createMany: {
            args: Prisma.KnownFaceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.KnownFaceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnownFacePayload>[]
          }
          delete: {
            args: Prisma.KnownFaceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnownFacePayload>
          }
          update: {
            args: Prisma.KnownFaceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnownFacePayload>
          }
          deleteMany: {
            args: Prisma.KnownFaceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.KnownFaceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.KnownFaceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnownFacePayload>[]
          }
          upsert: {
            args: Prisma.KnownFaceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnownFacePayload>
          }
          aggregate: {
            args: Prisma.KnownFaceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateKnownFace>
          }
          groupBy: {
            args: Prisma.KnownFaceGroupByArgs<ExtArgs>
            result: $Utils.Optional<KnownFaceGroupByOutputType>[]
          }
          count: {
            args: Prisma.KnownFaceCountArgs<ExtArgs>
            result: $Utils.Optional<KnownFaceCountAggregateOutputType> | number
          }
        }
      }
      Attendance: {
        payload: Prisma.$AttendancePayload<ExtArgs>
        fields: Prisma.AttendanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AttendanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AttendanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          findFirst: {
            args: Prisma.AttendanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AttendanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          findMany: {
            args: Prisma.AttendanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>[]
          }
          create: {
            args: Prisma.AttendanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          createMany: {
            args: Prisma.AttendanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AttendanceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>[]
          }
          delete: {
            args: Prisma.AttendanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          update: {
            args: Prisma.AttendanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          deleteMany: {
            args: Prisma.AttendanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AttendanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.AttendanceUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>[]
          }
          upsert: {
            args: Prisma.AttendanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          aggregate: {
            args: Prisma.AttendanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAttendance>
          }
          groupBy: {
            args: Prisma.AttendanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<AttendanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.AttendanceCountArgs<ExtArgs>
            result: $Utils.Optional<AttendanceCountAggregateOutputType> | number
          }
        }
      }
      BenchmarkResult: {
        payload: Prisma.$BenchmarkResultPayload<ExtArgs>
        fields: Prisma.BenchmarkResultFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BenchmarkResultFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BenchmarkResultPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BenchmarkResultFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BenchmarkResultPayload>
          }
          findFirst: {
            args: Prisma.BenchmarkResultFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BenchmarkResultPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BenchmarkResultFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BenchmarkResultPayload>
          }
          findMany: {
            args: Prisma.BenchmarkResultFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BenchmarkResultPayload>[]
          }
          create: {
            args: Prisma.BenchmarkResultCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BenchmarkResultPayload>
          }
          createMany: {
            args: Prisma.BenchmarkResultCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BenchmarkResultCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BenchmarkResultPayload>[]
          }
          delete: {
            args: Prisma.BenchmarkResultDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BenchmarkResultPayload>
          }
          update: {
            args: Prisma.BenchmarkResultUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BenchmarkResultPayload>
          }
          deleteMany: {
            args: Prisma.BenchmarkResultDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BenchmarkResultUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.BenchmarkResultUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BenchmarkResultPayload>[]
          }
          upsert: {
            args: Prisma.BenchmarkResultUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BenchmarkResultPayload>
          }
          aggregate: {
            args: Prisma.BenchmarkResultAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBenchmarkResult>
          }
          groupBy: {
            args: Prisma.BenchmarkResultGroupByArgs<ExtArgs>
            result: $Utils.Optional<BenchmarkResultGroupByOutputType>[]
          }
          count: {
            args: Prisma.BenchmarkResultCountArgs<ExtArgs>
            result: $Utils.Optional<BenchmarkResultCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    knownFace?: KnownFaceOmit
    attendance?: AttendanceOmit
    benchmarkResult?: BenchmarkResultOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type KnownFaceCountOutputType
   */

  export type KnownFaceCountOutputType = {
    Attendance: number
    BenchmarkResults: number
  }

  export type KnownFaceCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Attendance?: boolean | KnownFaceCountOutputTypeCountAttendanceArgs
    BenchmarkResults?: boolean | KnownFaceCountOutputTypeCountBenchmarkResultsArgs
  }

  // Custom InputTypes
  /**
   * KnownFaceCountOutputType without action
   */
  export type KnownFaceCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFaceCountOutputType
     */
    select?: KnownFaceCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * KnownFaceCountOutputType without action
   */
  export type KnownFaceCountOutputTypeCountAttendanceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttendanceWhereInput
  }

  /**
   * KnownFaceCountOutputType without action
   */
  export type KnownFaceCountOutputTypeCountBenchmarkResultsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BenchmarkResultWhereInput
  }


  /**
   * Models
   */

  /**
   * Model KnownFace
   */

  export type AggregateKnownFace = {
    _count: KnownFaceCountAggregateOutputType | null
    _avg: KnownFaceAvgAggregateOutputType | null
    _sum: KnownFaceSumAggregateOutputType | null
    _min: KnownFaceMinAggregateOutputType | null
    _max: KnownFaceMaxAggregateOutputType | null
  }

  export type KnownFaceAvgAggregateOutputType = {
    faceApiDescriptor: number | null
    arcfaceDescriptor: number | null
  }

  export type KnownFaceSumAggregateOutputType = {
    faceApiDescriptor: number[]
    arcfaceDescriptor: number[]
  }

  export type KnownFaceMinAggregateOutputType = {
    id: string | null
    name: string | null
  }

  export type KnownFaceMaxAggregateOutputType = {
    id: string | null
    name: string | null
  }

  export type KnownFaceCountAggregateOutputType = {
    id: number
    name: number
    faceApiDescriptor: number
    arcfaceDescriptor: number
    enrollmentImages: number
    _all: number
  }


  export type KnownFaceAvgAggregateInputType = {
    faceApiDescriptor?: true
    arcfaceDescriptor?: true
  }

  export type KnownFaceSumAggregateInputType = {
    faceApiDescriptor?: true
    arcfaceDescriptor?: true
  }

  export type KnownFaceMinAggregateInputType = {
    id?: true
    name?: true
  }

  export type KnownFaceMaxAggregateInputType = {
    id?: true
    name?: true
  }

  export type KnownFaceCountAggregateInputType = {
    id?: true
    name?: true
    faceApiDescriptor?: true
    arcfaceDescriptor?: true
    enrollmentImages?: true
    _all?: true
  }

  export type KnownFaceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KnownFace to aggregate.
     */
    where?: KnownFaceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KnownFaces to fetch.
     */
    orderBy?: KnownFaceOrderByWithRelationInput | KnownFaceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: KnownFaceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KnownFaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KnownFaces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned KnownFaces
    **/
    _count?: true | KnownFaceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: KnownFaceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: KnownFaceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KnownFaceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KnownFaceMaxAggregateInputType
  }

  export type GetKnownFaceAggregateType<T extends KnownFaceAggregateArgs> = {
        [P in keyof T & keyof AggregateKnownFace]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKnownFace[P]>
      : GetScalarType<T[P], AggregateKnownFace[P]>
  }




  export type KnownFaceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KnownFaceWhereInput
    orderBy?: KnownFaceOrderByWithAggregationInput | KnownFaceOrderByWithAggregationInput[]
    by: KnownFaceScalarFieldEnum[] | KnownFaceScalarFieldEnum
    having?: KnownFaceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KnownFaceCountAggregateInputType | true
    _avg?: KnownFaceAvgAggregateInputType
    _sum?: KnownFaceSumAggregateInputType
    _min?: KnownFaceMinAggregateInputType
    _max?: KnownFaceMaxAggregateInputType
  }

  export type KnownFaceGroupByOutputType = {
    id: string
    name: string
    faceApiDescriptor: number[]
    arcfaceDescriptor: number[]
    enrollmentImages: JsonValue
    _count: KnownFaceCountAggregateOutputType | null
    _avg: KnownFaceAvgAggregateOutputType | null
    _sum: KnownFaceSumAggregateOutputType | null
    _min: KnownFaceMinAggregateOutputType | null
    _max: KnownFaceMaxAggregateOutputType | null
  }

  type GetKnownFaceGroupByPayload<T extends KnownFaceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KnownFaceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KnownFaceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KnownFaceGroupByOutputType[P]>
            : GetScalarType<T[P], KnownFaceGroupByOutputType[P]>
        }
      >
    >


  export type KnownFaceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    faceApiDescriptor?: boolean
    arcfaceDescriptor?: boolean
    enrollmentImages?: boolean
    Attendance?: boolean | KnownFace$AttendanceArgs<ExtArgs>
    BenchmarkResults?: boolean | KnownFace$BenchmarkResultsArgs<ExtArgs>
    _count?: boolean | KnownFaceCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["knownFace"]>

  export type KnownFaceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    faceApiDescriptor?: boolean
    arcfaceDescriptor?: boolean
    enrollmentImages?: boolean
  }, ExtArgs["result"]["knownFace"]>

  export type KnownFaceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    faceApiDescriptor?: boolean
    arcfaceDescriptor?: boolean
    enrollmentImages?: boolean
  }, ExtArgs["result"]["knownFace"]>

  export type KnownFaceSelectScalar = {
    id?: boolean
    name?: boolean
    faceApiDescriptor?: boolean
    arcfaceDescriptor?: boolean
    enrollmentImages?: boolean
  }

  export type KnownFaceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "faceApiDescriptor" | "arcfaceDescriptor" | "enrollmentImages", ExtArgs["result"]["knownFace"]>
  export type KnownFaceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    Attendance?: boolean | KnownFace$AttendanceArgs<ExtArgs>
    BenchmarkResults?: boolean | KnownFace$BenchmarkResultsArgs<ExtArgs>
    _count?: boolean | KnownFaceCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type KnownFaceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type KnownFaceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $KnownFacePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "KnownFace"
    objects: {
      Attendance: Prisma.$AttendancePayload<ExtArgs>[]
      BenchmarkResults: Prisma.$BenchmarkResultPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      faceApiDescriptor: number[]
      arcfaceDescriptor: number[]
      enrollmentImages: Prisma.JsonValue
    }, ExtArgs["result"]["knownFace"]>
    composites: {}
  }

  type KnownFaceGetPayload<S extends boolean | null | undefined | KnownFaceDefaultArgs> = $Result.GetResult<Prisma.$KnownFacePayload, S>

  type KnownFaceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<KnownFaceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: KnownFaceCountAggregateInputType | true
    }

  export interface KnownFaceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['KnownFace'], meta: { name: 'KnownFace' } }
    /**
     * Find zero or one KnownFace that matches the filter.
     * @param {KnownFaceFindUniqueArgs} args - Arguments to find a KnownFace
     * @example
     * // Get one KnownFace
     * const knownFace = await prisma.knownFace.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends KnownFaceFindUniqueArgs>(args: SelectSubset<T, KnownFaceFindUniqueArgs<ExtArgs>>): Prisma__KnownFaceClient<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one KnownFace that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {KnownFaceFindUniqueOrThrowArgs} args - Arguments to find a KnownFace
     * @example
     * // Get one KnownFace
     * const knownFace = await prisma.knownFace.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends KnownFaceFindUniqueOrThrowArgs>(args: SelectSubset<T, KnownFaceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__KnownFaceClient<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first KnownFace that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnownFaceFindFirstArgs} args - Arguments to find a KnownFace
     * @example
     * // Get one KnownFace
     * const knownFace = await prisma.knownFace.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends KnownFaceFindFirstArgs>(args?: SelectSubset<T, KnownFaceFindFirstArgs<ExtArgs>>): Prisma__KnownFaceClient<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first KnownFace that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnownFaceFindFirstOrThrowArgs} args - Arguments to find a KnownFace
     * @example
     * // Get one KnownFace
     * const knownFace = await prisma.knownFace.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends KnownFaceFindFirstOrThrowArgs>(args?: SelectSubset<T, KnownFaceFindFirstOrThrowArgs<ExtArgs>>): Prisma__KnownFaceClient<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more KnownFaces that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnownFaceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all KnownFaces
     * const knownFaces = await prisma.knownFace.findMany()
     * 
     * // Get first 10 KnownFaces
     * const knownFaces = await prisma.knownFace.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const knownFaceWithIdOnly = await prisma.knownFace.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends KnownFaceFindManyArgs>(args?: SelectSubset<T, KnownFaceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a KnownFace.
     * @param {KnownFaceCreateArgs} args - Arguments to create a KnownFace.
     * @example
     * // Create one KnownFace
     * const KnownFace = await prisma.knownFace.create({
     *   data: {
     *     // ... data to create a KnownFace
     *   }
     * })
     * 
     */
    create<T extends KnownFaceCreateArgs>(args: SelectSubset<T, KnownFaceCreateArgs<ExtArgs>>): Prisma__KnownFaceClient<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many KnownFaces.
     * @param {KnownFaceCreateManyArgs} args - Arguments to create many KnownFaces.
     * @example
     * // Create many KnownFaces
     * const knownFace = await prisma.knownFace.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends KnownFaceCreateManyArgs>(args?: SelectSubset<T, KnownFaceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many KnownFaces and returns the data saved in the database.
     * @param {KnownFaceCreateManyAndReturnArgs} args - Arguments to create many KnownFaces.
     * @example
     * // Create many KnownFaces
     * const knownFace = await prisma.knownFace.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many KnownFaces and only return the `id`
     * const knownFaceWithIdOnly = await prisma.knownFace.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends KnownFaceCreateManyAndReturnArgs>(args?: SelectSubset<T, KnownFaceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a KnownFace.
     * @param {KnownFaceDeleteArgs} args - Arguments to delete one KnownFace.
     * @example
     * // Delete one KnownFace
     * const KnownFace = await prisma.knownFace.delete({
     *   where: {
     *     // ... filter to delete one KnownFace
     *   }
     * })
     * 
     */
    delete<T extends KnownFaceDeleteArgs>(args: SelectSubset<T, KnownFaceDeleteArgs<ExtArgs>>): Prisma__KnownFaceClient<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one KnownFace.
     * @param {KnownFaceUpdateArgs} args - Arguments to update one KnownFace.
     * @example
     * // Update one KnownFace
     * const knownFace = await prisma.knownFace.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends KnownFaceUpdateArgs>(args: SelectSubset<T, KnownFaceUpdateArgs<ExtArgs>>): Prisma__KnownFaceClient<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more KnownFaces.
     * @param {KnownFaceDeleteManyArgs} args - Arguments to filter KnownFaces to delete.
     * @example
     * // Delete a few KnownFaces
     * const { count } = await prisma.knownFace.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends KnownFaceDeleteManyArgs>(args?: SelectSubset<T, KnownFaceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KnownFaces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnownFaceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many KnownFaces
     * const knownFace = await prisma.knownFace.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends KnownFaceUpdateManyArgs>(args: SelectSubset<T, KnownFaceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more KnownFaces and returns the data updated in the database.
     * @param {KnownFaceUpdateManyAndReturnArgs} args - Arguments to update many KnownFaces.
     * @example
     * // Update many KnownFaces
     * const knownFace = await prisma.knownFace.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more KnownFaces and only return the `id`
     * const knownFaceWithIdOnly = await prisma.knownFace.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends KnownFaceUpdateManyAndReturnArgs>(args: SelectSubset<T, KnownFaceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one KnownFace.
     * @param {KnownFaceUpsertArgs} args - Arguments to update or create a KnownFace.
     * @example
     * // Update or create a KnownFace
     * const knownFace = await prisma.knownFace.upsert({
     *   create: {
     *     // ... data to create a KnownFace
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the KnownFace we want to update
     *   }
     * })
     */
    upsert<T extends KnownFaceUpsertArgs>(args: SelectSubset<T, KnownFaceUpsertArgs<ExtArgs>>): Prisma__KnownFaceClient<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of KnownFaces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnownFaceCountArgs} args - Arguments to filter KnownFaces to count.
     * @example
     * // Count the number of KnownFaces
     * const count = await prisma.knownFace.count({
     *   where: {
     *     // ... the filter for the KnownFaces we want to count
     *   }
     * })
    **/
    count<T extends KnownFaceCountArgs>(
      args?: Subset<T, KnownFaceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KnownFaceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a KnownFace.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnownFaceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends KnownFaceAggregateArgs>(args: Subset<T, KnownFaceAggregateArgs>): Prisma.PrismaPromise<GetKnownFaceAggregateType<T>>

    /**
     * Group by KnownFace.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnownFaceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends KnownFaceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: KnownFaceGroupByArgs['orderBy'] }
        : { orderBy?: KnownFaceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, KnownFaceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKnownFaceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the KnownFace model
   */
  readonly fields: KnownFaceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for KnownFace.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__KnownFaceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    Attendance<T extends KnownFace$AttendanceArgs<ExtArgs> = {}>(args?: Subset<T, KnownFace$AttendanceArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    BenchmarkResults<T extends KnownFace$BenchmarkResultsArgs<ExtArgs> = {}>(args?: Subset<T, KnownFace$BenchmarkResultsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BenchmarkResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the KnownFace model
   */
  interface KnownFaceFieldRefs {
    readonly id: FieldRef<"KnownFace", 'String'>
    readonly name: FieldRef<"KnownFace", 'String'>
    readonly faceApiDescriptor: FieldRef<"KnownFace", 'Float[]'>
    readonly arcfaceDescriptor: FieldRef<"KnownFace", 'Float[]'>
    readonly enrollmentImages: FieldRef<"KnownFace", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * KnownFace findUnique
   */
  export type KnownFaceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFace
     */
    select?: KnownFaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KnownFace
     */
    omit?: KnownFaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnownFaceInclude<ExtArgs> | null
    /**
     * Filter, which KnownFace to fetch.
     */
    where: KnownFaceWhereUniqueInput
  }

  /**
   * KnownFace findUniqueOrThrow
   */
  export type KnownFaceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFace
     */
    select?: KnownFaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KnownFace
     */
    omit?: KnownFaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnownFaceInclude<ExtArgs> | null
    /**
     * Filter, which KnownFace to fetch.
     */
    where: KnownFaceWhereUniqueInput
  }

  /**
   * KnownFace findFirst
   */
  export type KnownFaceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFace
     */
    select?: KnownFaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KnownFace
     */
    omit?: KnownFaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnownFaceInclude<ExtArgs> | null
    /**
     * Filter, which KnownFace to fetch.
     */
    where?: KnownFaceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KnownFaces to fetch.
     */
    orderBy?: KnownFaceOrderByWithRelationInput | KnownFaceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KnownFaces.
     */
    cursor?: KnownFaceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KnownFaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KnownFaces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KnownFaces.
     */
    distinct?: KnownFaceScalarFieldEnum | KnownFaceScalarFieldEnum[]
  }

  /**
   * KnownFace findFirstOrThrow
   */
  export type KnownFaceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFace
     */
    select?: KnownFaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KnownFace
     */
    omit?: KnownFaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnownFaceInclude<ExtArgs> | null
    /**
     * Filter, which KnownFace to fetch.
     */
    where?: KnownFaceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KnownFaces to fetch.
     */
    orderBy?: KnownFaceOrderByWithRelationInput | KnownFaceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for KnownFaces.
     */
    cursor?: KnownFaceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KnownFaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KnownFaces.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of KnownFaces.
     */
    distinct?: KnownFaceScalarFieldEnum | KnownFaceScalarFieldEnum[]
  }

  /**
   * KnownFace findMany
   */
  export type KnownFaceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFace
     */
    select?: KnownFaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KnownFace
     */
    omit?: KnownFaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnownFaceInclude<ExtArgs> | null
    /**
     * Filter, which KnownFaces to fetch.
     */
    where?: KnownFaceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of KnownFaces to fetch.
     */
    orderBy?: KnownFaceOrderByWithRelationInput | KnownFaceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing KnownFaces.
     */
    cursor?: KnownFaceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` KnownFaces from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` KnownFaces.
     */
    skip?: number
    distinct?: KnownFaceScalarFieldEnum | KnownFaceScalarFieldEnum[]
  }

  /**
   * KnownFace create
   */
  export type KnownFaceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFace
     */
    select?: KnownFaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KnownFace
     */
    omit?: KnownFaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnownFaceInclude<ExtArgs> | null
    /**
     * The data needed to create a KnownFace.
     */
    data: XOR<KnownFaceCreateInput, KnownFaceUncheckedCreateInput>
  }

  /**
   * KnownFace createMany
   */
  export type KnownFaceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many KnownFaces.
     */
    data: KnownFaceCreateManyInput | KnownFaceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * KnownFace createManyAndReturn
   */
  export type KnownFaceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFace
     */
    select?: KnownFaceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the KnownFace
     */
    omit?: KnownFaceOmit<ExtArgs> | null
    /**
     * The data used to create many KnownFaces.
     */
    data: KnownFaceCreateManyInput | KnownFaceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * KnownFace update
   */
  export type KnownFaceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFace
     */
    select?: KnownFaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KnownFace
     */
    omit?: KnownFaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnownFaceInclude<ExtArgs> | null
    /**
     * The data needed to update a KnownFace.
     */
    data: XOR<KnownFaceUpdateInput, KnownFaceUncheckedUpdateInput>
    /**
     * Choose, which KnownFace to update.
     */
    where: KnownFaceWhereUniqueInput
  }

  /**
   * KnownFace updateMany
   */
  export type KnownFaceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update KnownFaces.
     */
    data: XOR<KnownFaceUpdateManyMutationInput, KnownFaceUncheckedUpdateManyInput>
    /**
     * Filter which KnownFaces to update
     */
    where?: KnownFaceWhereInput
    /**
     * Limit how many KnownFaces to update.
     */
    limit?: number
  }

  /**
   * KnownFace updateManyAndReturn
   */
  export type KnownFaceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFace
     */
    select?: KnownFaceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the KnownFace
     */
    omit?: KnownFaceOmit<ExtArgs> | null
    /**
     * The data used to update KnownFaces.
     */
    data: XOR<KnownFaceUpdateManyMutationInput, KnownFaceUncheckedUpdateManyInput>
    /**
     * Filter which KnownFaces to update
     */
    where?: KnownFaceWhereInput
    /**
     * Limit how many KnownFaces to update.
     */
    limit?: number
  }

  /**
   * KnownFace upsert
   */
  export type KnownFaceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFace
     */
    select?: KnownFaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KnownFace
     */
    omit?: KnownFaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnownFaceInclude<ExtArgs> | null
    /**
     * The filter to search for the KnownFace to update in case it exists.
     */
    where: KnownFaceWhereUniqueInput
    /**
     * In case the KnownFace found by the `where` argument doesn't exist, create a new KnownFace with this data.
     */
    create: XOR<KnownFaceCreateInput, KnownFaceUncheckedCreateInput>
    /**
     * In case the KnownFace was found with the provided `where` argument, update it with this data.
     */
    update: XOR<KnownFaceUpdateInput, KnownFaceUncheckedUpdateInput>
  }

  /**
   * KnownFace delete
   */
  export type KnownFaceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFace
     */
    select?: KnownFaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KnownFace
     */
    omit?: KnownFaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnownFaceInclude<ExtArgs> | null
    /**
     * Filter which KnownFace to delete.
     */
    where: KnownFaceWhereUniqueInput
  }

  /**
   * KnownFace deleteMany
   */
  export type KnownFaceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which KnownFaces to delete
     */
    where?: KnownFaceWhereInput
    /**
     * Limit how many KnownFaces to delete.
     */
    limit?: number
  }

  /**
   * KnownFace.Attendance
   */
  export type KnownFace$AttendanceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    where?: AttendanceWhereInput
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    cursor?: AttendanceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * KnownFace.BenchmarkResults
   */
  export type KnownFace$BenchmarkResultsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultInclude<ExtArgs> | null
    where?: BenchmarkResultWhereInput
    orderBy?: BenchmarkResultOrderByWithRelationInput | BenchmarkResultOrderByWithRelationInput[]
    cursor?: BenchmarkResultWhereUniqueInput
    take?: number
    skip?: number
    distinct?: BenchmarkResultScalarFieldEnum | BenchmarkResultScalarFieldEnum[]
  }

  /**
   * KnownFace without action
   */
  export type KnownFaceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the KnownFace
     */
    select?: KnownFaceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the KnownFace
     */
    omit?: KnownFaceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnownFaceInclude<ExtArgs> | null
  }


  /**
   * Model Attendance
   */

  export type AggregateAttendance = {
    _count: AttendanceCountAggregateOutputType | null
    _avg: AttendanceAvgAggregateOutputType | null
    _sum: AttendanceSumAggregateOutputType | null
    _min: AttendanceMinAggregateOutputType | null
    _max: AttendanceMaxAggregateOutputType | null
  }

  export type AttendanceAvgAggregateOutputType = {
    id: number | null
    similarity: number | null
    latencyMs: number | null
  }

  export type AttendanceSumAggregateOutputType = {
    id: bigint | null
    similarity: number | null
    latencyMs: number | null
  }

  export type AttendanceMinAggregateOutputType = {
    id: bigint | null
    userId: string | null
    similarity: number | null
    latencyMs: number | null
    model: string | null
    createdAt: Date | null
  }

  export type AttendanceMaxAggregateOutputType = {
    id: bigint | null
    userId: string | null
    similarity: number | null
    latencyMs: number | null
    model: string | null
    createdAt: Date | null
  }

  export type AttendanceCountAggregateOutputType = {
    id: number
    userId: number
    similarity: number
    latencyMs: number
    model: number
    createdAt: number
    _all: number
  }


  export type AttendanceAvgAggregateInputType = {
    id?: true
    similarity?: true
    latencyMs?: true
  }

  export type AttendanceSumAggregateInputType = {
    id?: true
    similarity?: true
    latencyMs?: true
  }

  export type AttendanceMinAggregateInputType = {
    id?: true
    userId?: true
    similarity?: true
    latencyMs?: true
    model?: true
    createdAt?: true
  }

  export type AttendanceMaxAggregateInputType = {
    id?: true
    userId?: true
    similarity?: true
    latencyMs?: true
    model?: true
    createdAt?: true
  }

  export type AttendanceCountAggregateInputType = {
    id?: true
    userId?: true
    similarity?: true
    latencyMs?: true
    model?: true
    createdAt?: true
    _all?: true
  }

  export type AttendanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attendance to aggregate.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Attendances
    **/
    _count?: true | AttendanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AttendanceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AttendanceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AttendanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AttendanceMaxAggregateInputType
  }

  export type GetAttendanceAggregateType<T extends AttendanceAggregateArgs> = {
        [P in keyof T & keyof AggregateAttendance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAttendance[P]>
      : GetScalarType<T[P], AggregateAttendance[P]>
  }




  export type AttendanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttendanceWhereInput
    orderBy?: AttendanceOrderByWithAggregationInput | AttendanceOrderByWithAggregationInput[]
    by: AttendanceScalarFieldEnum[] | AttendanceScalarFieldEnum
    having?: AttendanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AttendanceCountAggregateInputType | true
    _avg?: AttendanceAvgAggregateInputType
    _sum?: AttendanceSumAggregateInputType
    _min?: AttendanceMinAggregateInputType
    _max?: AttendanceMaxAggregateInputType
  }

  export type AttendanceGroupByOutputType = {
    id: bigint
    userId: string
    similarity: number
    latencyMs: number
    model: string
    createdAt: Date
    _count: AttendanceCountAggregateOutputType | null
    _avg: AttendanceAvgAggregateOutputType | null
    _sum: AttendanceSumAggregateOutputType | null
    _min: AttendanceMinAggregateOutputType | null
    _max: AttendanceMaxAggregateOutputType | null
  }

  type GetAttendanceGroupByPayload<T extends AttendanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AttendanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AttendanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AttendanceGroupByOutputType[P]>
            : GetScalarType<T[P], AttendanceGroupByOutputType[P]>
        }
      >
    >


  export type AttendanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    similarity?: boolean
    latencyMs?: boolean
    model?: boolean
    createdAt?: boolean
    user?: boolean | KnownFaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attendance"]>

  export type AttendanceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    similarity?: boolean
    latencyMs?: boolean
    model?: boolean
    createdAt?: boolean
    user?: boolean | KnownFaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attendance"]>

  export type AttendanceSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    similarity?: boolean
    latencyMs?: boolean
    model?: boolean
    createdAt?: boolean
    user?: boolean | KnownFaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attendance"]>

  export type AttendanceSelectScalar = {
    id?: boolean
    userId?: boolean
    similarity?: boolean
    latencyMs?: boolean
    model?: boolean
    createdAt?: boolean
  }

  export type AttendanceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "similarity" | "latencyMs" | "model" | "createdAt", ExtArgs["result"]["attendance"]>
  export type AttendanceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | KnownFaceDefaultArgs<ExtArgs>
  }
  export type AttendanceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | KnownFaceDefaultArgs<ExtArgs>
  }
  export type AttendanceIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | KnownFaceDefaultArgs<ExtArgs>
  }

  export type $AttendancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Attendance"
    objects: {
      user: Prisma.$KnownFacePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      userId: string
      similarity: number
      latencyMs: number
      model: string
      createdAt: Date
    }, ExtArgs["result"]["attendance"]>
    composites: {}
  }

  type AttendanceGetPayload<S extends boolean | null | undefined | AttendanceDefaultArgs> = $Result.GetResult<Prisma.$AttendancePayload, S>

  type AttendanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<AttendanceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AttendanceCountAggregateInputType | true
    }

  export interface AttendanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Attendance'], meta: { name: 'Attendance' } }
    /**
     * Find zero or one Attendance that matches the filter.
     * @param {AttendanceFindUniqueArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AttendanceFindUniqueArgs>(args: SelectSubset<T, AttendanceFindUniqueArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Attendance that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {AttendanceFindUniqueOrThrowArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AttendanceFindUniqueOrThrowArgs>(args: SelectSubset<T, AttendanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attendance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindFirstArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AttendanceFindFirstArgs>(args?: SelectSubset<T, AttendanceFindFirstArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Attendance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindFirstOrThrowArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AttendanceFindFirstOrThrowArgs>(args?: SelectSubset<T, AttendanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Attendances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Attendances
     * const attendances = await prisma.attendance.findMany()
     * 
     * // Get first 10 Attendances
     * const attendances = await prisma.attendance.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const attendanceWithIdOnly = await prisma.attendance.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AttendanceFindManyArgs>(args?: SelectSubset<T, AttendanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Attendance.
     * @param {AttendanceCreateArgs} args - Arguments to create a Attendance.
     * @example
     * // Create one Attendance
     * const Attendance = await prisma.attendance.create({
     *   data: {
     *     // ... data to create a Attendance
     *   }
     * })
     * 
     */
    create<T extends AttendanceCreateArgs>(args: SelectSubset<T, AttendanceCreateArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Attendances.
     * @param {AttendanceCreateManyArgs} args - Arguments to create many Attendances.
     * @example
     * // Create many Attendances
     * const attendance = await prisma.attendance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AttendanceCreateManyArgs>(args?: SelectSubset<T, AttendanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Attendances and returns the data saved in the database.
     * @param {AttendanceCreateManyAndReturnArgs} args - Arguments to create many Attendances.
     * @example
     * // Create many Attendances
     * const attendance = await prisma.attendance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Attendances and only return the `id`
     * const attendanceWithIdOnly = await prisma.attendance.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AttendanceCreateManyAndReturnArgs>(args?: SelectSubset<T, AttendanceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Attendance.
     * @param {AttendanceDeleteArgs} args - Arguments to delete one Attendance.
     * @example
     * // Delete one Attendance
     * const Attendance = await prisma.attendance.delete({
     *   where: {
     *     // ... filter to delete one Attendance
     *   }
     * })
     * 
     */
    delete<T extends AttendanceDeleteArgs>(args: SelectSubset<T, AttendanceDeleteArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Attendance.
     * @param {AttendanceUpdateArgs} args - Arguments to update one Attendance.
     * @example
     * // Update one Attendance
     * const attendance = await prisma.attendance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AttendanceUpdateArgs>(args: SelectSubset<T, AttendanceUpdateArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Attendances.
     * @param {AttendanceDeleteManyArgs} args - Arguments to filter Attendances to delete.
     * @example
     * // Delete a few Attendances
     * const { count } = await prisma.attendance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AttendanceDeleteManyArgs>(args?: SelectSubset<T, AttendanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attendances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Attendances
     * const attendance = await prisma.attendance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AttendanceUpdateManyArgs>(args: SelectSubset<T, AttendanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attendances and returns the data updated in the database.
     * @param {AttendanceUpdateManyAndReturnArgs} args - Arguments to update many Attendances.
     * @example
     * // Update many Attendances
     * const attendance = await prisma.attendance.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Attendances and only return the `id`
     * const attendanceWithIdOnly = await prisma.attendance.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends AttendanceUpdateManyAndReturnArgs>(args: SelectSubset<T, AttendanceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Attendance.
     * @param {AttendanceUpsertArgs} args - Arguments to update or create a Attendance.
     * @example
     * // Update or create a Attendance
     * const attendance = await prisma.attendance.upsert({
     *   create: {
     *     // ... data to create a Attendance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Attendance we want to update
     *   }
     * })
     */
    upsert<T extends AttendanceUpsertArgs>(args: SelectSubset<T, AttendanceUpsertArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Attendances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceCountArgs} args - Arguments to filter Attendances to count.
     * @example
     * // Count the number of Attendances
     * const count = await prisma.attendance.count({
     *   where: {
     *     // ... the filter for the Attendances we want to count
     *   }
     * })
    **/
    count<T extends AttendanceCountArgs>(
      args?: Subset<T, AttendanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AttendanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Attendance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AttendanceAggregateArgs>(args: Subset<T, AttendanceAggregateArgs>): Prisma.PrismaPromise<GetAttendanceAggregateType<T>>

    /**
     * Group by Attendance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AttendanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AttendanceGroupByArgs['orderBy'] }
        : { orderBy?: AttendanceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AttendanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttendanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Attendance model
   */
  readonly fields: AttendanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Attendance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AttendanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends KnownFaceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, KnownFaceDefaultArgs<ExtArgs>>): Prisma__KnownFaceClient<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Attendance model
   */
  interface AttendanceFieldRefs {
    readonly id: FieldRef<"Attendance", 'BigInt'>
    readonly userId: FieldRef<"Attendance", 'String'>
    readonly similarity: FieldRef<"Attendance", 'Float'>
    readonly latencyMs: FieldRef<"Attendance", 'Float'>
    readonly model: FieldRef<"Attendance", 'String'>
    readonly createdAt: FieldRef<"Attendance", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Attendance findUnique
   */
  export type AttendanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance findUniqueOrThrow
   */
  export type AttendanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance findFirst
   */
  export type AttendanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attendances.
     */
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance findFirstOrThrow
   */
  export type AttendanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attendances.
     */
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance findMany
   */
  export type AttendanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter, which Attendances to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance create
   */
  export type AttendanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * The data needed to create a Attendance.
     */
    data: XOR<AttendanceCreateInput, AttendanceUncheckedCreateInput>
  }

  /**
   * Attendance createMany
   */
  export type AttendanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Attendances.
     */
    data: AttendanceCreateManyInput | AttendanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Attendance createManyAndReturn
   */
  export type AttendanceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * The data used to create many Attendances.
     */
    data: AttendanceCreateManyInput | AttendanceCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Attendance update
   */
  export type AttendanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * The data needed to update a Attendance.
     */
    data: XOR<AttendanceUpdateInput, AttendanceUncheckedUpdateInput>
    /**
     * Choose, which Attendance to update.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance updateMany
   */
  export type AttendanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Attendances.
     */
    data: XOR<AttendanceUpdateManyMutationInput, AttendanceUncheckedUpdateManyInput>
    /**
     * Filter which Attendances to update
     */
    where?: AttendanceWhereInput
    /**
     * Limit how many Attendances to update.
     */
    limit?: number
  }

  /**
   * Attendance updateManyAndReturn
   */
  export type AttendanceUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * The data used to update Attendances.
     */
    data: XOR<AttendanceUpdateManyMutationInput, AttendanceUncheckedUpdateManyInput>
    /**
     * Filter which Attendances to update
     */
    where?: AttendanceWhereInput
    /**
     * Limit how many Attendances to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Attendance upsert
   */
  export type AttendanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * The filter to search for the Attendance to update in case it exists.
     */
    where: AttendanceWhereUniqueInput
    /**
     * In case the Attendance found by the `where` argument doesn't exist, create a new Attendance with this data.
     */
    create: XOR<AttendanceCreateInput, AttendanceUncheckedCreateInput>
    /**
     * In case the Attendance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AttendanceUpdateInput, AttendanceUncheckedUpdateInput>
  }

  /**
   * Attendance delete
   */
  export type AttendanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
    /**
     * Filter which Attendance to delete.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance deleteMany
   */
  export type AttendanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attendances to delete
     */
    where?: AttendanceWhereInput
    /**
     * Limit how many Attendances to delete.
     */
    limit?: number
  }

  /**
   * Attendance without action
   */
  export type AttendanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Attendance
     */
    omit?: AttendanceOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttendanceInclude<ExtArgs> | null
  }


  /**
   * Model BenchmarkResult
   */

  export type AggregateBenchmarkResult = {
    _count: BenchmarkResultCountAggregateOutputType | null
    _avg: BenchmarkResultAvgAggregateOutputType | null
    _sum: BenchmarkResultSumAggregateOutputType | null
    _min: BenchmarkResultMinAggregateOutputType | null
    _max: BenchmarkResultMaxAggregateOutputType | null
  }

  export type BenchmarkResultAvgAggregateOutputType = {
    id: number | null
    faceApiAccuracy: number | null
    faceApiLatency: number | null
    arcfaceAccuracy: number | null
    arcfaceLatency: number | null
  }

  export type BenchmarkResultSumAggregateOutputType = {
    id: bigint | null
    faceApiAccuracy: number | null
    faceApiLatency: number | null
    arcfaceAccuracy: number | null
    arcfaceLatency: number | null
  }

  export type BenchmarkResultMinAggregateOutputType = {
    id: bigint | null
    userId: string | null
    faceApiAccuracy: number | null
    faceApiLatency: number | null
    arcfaceAccuracy: number | null
    arcfaceLatency: number | null
    testImage: string | null
    createdAt: Date | null
  }

  export type BenchmarkResultMaxAggregateOutputType = {
    id: bigint | null
    userId: string | null
    faceApiAccuracy: number | null
    faceApiLatency: number | null
    arcfaceAccuracy: number | null
    arcfaceLatency: number | null
    testImage: string | null
    createdAt: Date | null
  }

  export type BenchmarkResultCountAggregateOutputType = {
    id: number
    userId: number
    faceApiAccuracy: number
    faceApiLatency: number
    arcfaceAccuracy: number
    arcfaceLatency: number
    testImage: number
    createdAt: number
    _all: number
  }


  export type BenchmarkResultAvgAggregateInputType = {
    id?: true
    faceApiAccuracy?: true
    faceApiLatency?: true
    arcfaceAccuracy?: true
    arcfaceLatency?: true
  }

  export type BenchmarkResultSumAggregateInputType = {
    id?: true
    faceApiAccuracy?: true
    faceApiLatency?: true
    arcfaceAccuracy?: true
    arcfaceLatency?: true
  }

  export type BenchmarkResultMinAggregateInputType = {
    id?: true
    userId?: true
    faceApiAccuracy?: true
    faceApiLatency?: true
    arcfaceAccuracy?: true
    arcfaceLatency?: true
    testImage?: true
    createdAt?: true
  }

  export type BenchmarkResultMaxAggregateInputType = {
    id?: true
    userId?: true
    faceApiAccuracy?: true
    faceApiLatency?: true
    arcfaceAccuracy?: true
    arcfaceLatency?: true
    testImage?: true
    createdAt?: true
  }

  export type BenchmarkResultCountAggregateInputType = {
    id?: true
    userId?: true
    faceApiAccuracy?: true
    faceApiLatency?: true
    arcfaceAccuracy?: true
    arcfaceLatency?: true
    testImage?: true
    createdAt?: true
    _all?: true
  }

  export type BenchmarkResultAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BenchmarkResult to aggregate.
     */
    where?: BenchmarkResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BenchmarkResults to fetch.
     */
    orderBy?: BenchmarkResultOrderByWithRelationInput | BenchmarkResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BenchmarkResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BenchmarkResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BenchmarkResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned BenchmarkResults
    **/
    _count?: true | BenchmarkResultCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: BenchmarkResultAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: BenchmarkResultSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BenchmarkResultMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BenchmarkResultMaxAggregateInputType
  }

  export type GetBenchmarkResultAggregateType<T extends BenchmarkResultAggregateArgs> = {
        [P in keyof T & keyof AggregateBenchmarkResult]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBenchmarkResult[P]>
      : GetScalarType<T[P], AggregateBenchmarkResult[P]>
  }




  export type BenchmarkResultGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BenchmarkResultWhereInput
    orderBy?: BenchmarkResultOrderByWithAggregationInput | BenchmarkResultOrderByWithAggregationInput[]
    by: BenchmarkResultScalarFieldEnum[] | BenchmarkResultScalarFieldEnum
    having?: BenchmarkResultScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BenchmarkResultCountAggregateInputType | true
    _avg?: BenchmarkResultAvgAggregateInputType
    _sum?: BenchmarkResultSumAggregateInputType
    _min?: BenchmarkResultMinAggregateInputType
    _max?: BenchmarkResultMaxAggregateInputType
  }

  export type BenchmarkResultGroupByOutputType = {
    id: bigint
    userId: string
    faceApiAccuracy: number | null
    faceApiLatency: number | null
    arcfaceAccuracy: number | null
    arcfaceLatency: number | null
    testImage: string
    createdAt: Date
    _count: BenchmarkResultCountAggregateOutputType | null
    _avg: BenchmarkResultAvgAggregateOutputType | null
    _sum: BenchmarkResultSumAggregateOutputType | null
    _min: BenchmarkResultMinAggregateOutputType | null
    _max: BenchmarkResultMaxAggregateOutputType | null
  }

  type GetBenchmarkResultGroupByPayload<T extends BenchmarkResultGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BenchmarkResultGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BenchmarkResultGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BenchmarkResultGroupByOutputType[P]>
            : GetScalarType<T[P], BenchmarkResultGroupByOutputType[P]>
        }
      >
    >


  export type BenchmarkResultSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    faceApiAccuracy?: boolean
    faceApiLatency?: boolean
    arcfaceAccuracy?: boolean
    arcfaceLatency?: boolean
    testImage?: boolean
    createdAt?: boolean
    user?: boolean | KnownFaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["benchmarkResult"]>

  export type BenchmarkResultSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    faceApiAccuracy?: boolean
    faceApiLatency?: boolean
    arcfaceAccuracy?: boolean
    arcfaceLatency?: boolean
    testImage?: boolean
    createdAt?: boolean
    user?: boolean | KnownFaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["benchmarkResult"]>

  export type BenchmarkResultSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    faceApiAccuracy?: boolean
    faceApiLatency?: boolean
    arcfaceAccuracy?: boolean
    arcfaceLatency?: boolean
    testImage?: boolean
    createdAt?: boolean
    user?: boolean | KnownFaceDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["benchmarkResult"]>

  export type BenchmarkResultSelectScalar = {
    id?: boolean
    userId?: boolean
    faceApiAccuracy?: boolean
    faceApiLatency?: boolean
    arcfaceAccuracy?: boolean
    arcfaceLatency?: boolean
    testImage?: boolean
    createdAt?: boolean
  }

  export type BenchmarkResultOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "faceApiAccuracy" | "faceApiLatency" | "arcfaceAccuracy" | "arcfaceLatency" | "testImage" | "createdAt", ExtArgs["result"]["benchmarkResult"]>
  export type BenchmarkResultInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | KnownFaceDefaultArgs<ExtArgs>
  }
  export type BenchmarkResultIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | KnownFaceDefaultArgs<ExtArgs>
  }
  export type BenchmarkResultIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | KnownFaceDefaultArgs<ExtArgs>
  }

  export type $BenchmarkResultPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "BenchmarkResult"
    objects: {
      user: Prisma.$KnownFacePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: bigint
      userId: string
      faceApiAccuracy: number | null
      faceApiLatency: number | null
      arcfaceAccuracy: number | null
      arcfaceLatency: number | null
      testImage: string
      createdAt: Date
    }, ExtArgs["result"]["benchmarkResult"]>
    composites: {}
  }

  type BenchmarkResultGetPayload<S extends boolean | null | undefined | BenchmarkResultDefaultArgs> = $Result.GetResult<Prisma.$BenchmarkResultPayload, S>

  type BenchmarkResultCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<BenchmarkResultFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: BenchmarkResultCountAggregateInputType | true
    }

  export interface BenchmarkResultDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['BenchmarkResult'], meta: { name: 'BenchmarkResult' } }
    /**
     * Find zero or one BenchmarkResult that matches the filter.
     * @param {BenchmarkResultFindUniqueArgs} args - Arguments to find a BenchmarkResult
     * @example
     * // Get one BenchmarkResult
     * const benchmarkResult = await prisma.benchmarkResult.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BenchmarkResultFindUniqueArgs>(args: SelectSubset<T, BenchmarkResultFindUniqueArgs<ExtArgs>>): Prisma__BenchmarkResultClient<$Result.GetResult<Prisma.$BenchmarkResultPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one BenchmarkResult that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {BenchmarkResultFindUniqueOrThrowArgs} args - Arguments to find a BenchmarkResult
     * @example
     * // Get one BenchmarkResult
     * const benchmarkResult = await prisma.benchmarkResult.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BenchmarkResultFindUniqueOrThrowArgs>(args: SelectSubset<T, BenchmarkResultFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BenchmarkResultClient<$Result.GetResult<Prisma.$BenchmarkResultPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BenchmarkResult that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BenchmarkResultFindFirstArgs} args - Arguments to find a BenchmarkResult
     * @example
     * // Get one BenchmarkResult
     * const benchmarkResult = await prisma.benchmarkResult.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BenchmarkResultFindFirstArgs>(args?: SelectSubset<T, BenchmarkResultFindFirstArgs<ExtArgs>>): Prisma__BenchmarkResultClient<$Result.GetResult<Prisma.$BenchmarkResultPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first BenchmarkResult that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BenchmarkResultFindFirstOrThrowArgs} args - Arguments to find a BenchmarkResult
     * @example
     * // Get one BenchmarkResult
     * const benchmarkResult = await prisma.benchmarkResult.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BenchmarkResultFindFirstOrThrowArgs>(args?: SelectSubset<T, BenchmarkResultFindFirstOrThrowArgs<ExtArgs>>): Prisma__BenchmarkResultClient<$Result.GetResult<Prisma.$BenchmarkResultPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more BenchmarkResults that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BenchmarkResultFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all BenchmarkResults
     * const benchmarkResults = await prisma.benchmarkResult.findMany()
     * 
     * // Get first 10 BenchmarkResults
     * const benchmarkResults = await prisma.benchmarkResult.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const benchmarkResultWithIdOnly = await prisma.benchmarkResult.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BenchmarkResultFindManyArgs>(args?: SelectSubset<T, BenchmarkResultFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BenchmarkResultPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a BenchmarkResult.
     * @param {BenchmarkResultCreateArgs} args - Arguments to create a BenchmarkResult.
     * @example
     * // Create one BenchmarkResult
     * const BenchmarkResult = await prisma.benchmarkResult.create({
     *   data: {
     *     // ... data to create a BenchmarkResult
     *   }
     * })
     * 
     */
    create<T extends BenchmarkResultCreateArgs>(args: SelectSubset<T, BenchmarkResultCreateArgs<ExtArgs>>): Prisma__BenchmarkResultClient<$Result.GetResult<Prisma.$BenchmarkResultPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many BenchmarkResults.
     * @param {BenchmarkResultCreateManyArgs} args - Arguments to create many BenchmarkResults.
     * @example
     * // Create many BenchmarkResults
     * const benchmarkResult = await prisma.benchmarkResult.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BenchmarkResultCreateManyArgs>(args?: SelectSubset<T, BenchmarkResultCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many BenchmarkResults and returns the data saved in the database.
     * @param {BenchmarkResultCreateManyAndReturnArgs} args - Arguments to create many BenchmarkResults.
     * @example
     * // Create many BenchmarkResults
     * const benchmarkResult = await prisma.benchmarkResult.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many BenchmarkResults and only return the `id`
     * const benchmarkResultWithIdOnly = await prisma.benchmarkResult.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BenchmarkResultCreateManyAndReturnArgs>(args?: SelectSubset<T, BenchmarkResultCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BenchmarkResultPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a BenchmarkResult.
     * @param {BenchmarkResultDeleteArgs} args - Arguments to delete one BenchmarkResult.
     * @example
     * // Delete one BenchmarkResult
     * const BenchmarkResult = await prisma.benchmarkResult.delete({
     *   where: {
     *     // ... filter to delete one BenchmarkResult
     *   }
     * })
     * 
     */
    delete<T extends BenchmarkResultDeleteArgs>(args: SelectSubset<T, BenchmarkResultDeleteArgs<ExtArgs>>): Prisma__BenchmarkResultClient<$Result.GetResult<Prisma.$BenchmarkResultPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one BenchmarkResult.
     * @param {BenchmarkResultUpdateArgs} args - Arguments to update one BenchmarkResult.
     * @example
     * // Update one BenchmarkResult
     * const benchmarkResult = await prisma.benchmarkResult.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BenchmarkResultUpdateArgs>(args: SelectSubset<T, BenchmarkResultUpdateArgs<ExtArgs>>): Prisma__BenchmarkResultClient<$Result.GetResult<Prisma.$BenchmarkResultPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more BenchmarkResults.
     * @param {BenchmarkResultDeleteManyArgs} args - Arguments to filter BenchmarkResults to delete.
     * @example
     * // Delete a few BenchmarkResults
     * const { count } = await prisma.benchmarkResult.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BenchmarkResultDeleteManyArgs>(args?: SelectSubset<T, BenchmarkResultDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BenchmarkResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BenchmarkResultUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many BenchmarkResults
     * const benchmarkResult = await prisma.benchmarkResult.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BenchmarkResultUpdateManyArgs>(args: SelectSubset<T, BenchmarkResultUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more BenchmarkResults and returns the data updated in the database.
     * @param {BenchmarkResultUpdateManyAndReturnArgs} args - Arguments to update many BenchmarkResults.
     * @example
     * // Update many BenchmarkResults
     * const benchmarkResult = await prisma.benchmarkResult.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more BenchmarkResults and only return the `id`
     * const benchmarkResultWithIdOnly = await prisma.benchmarkResult.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends BenchmarkResultUpdateManyAndReturnArgs>(args: SelectSubset<T, BenchmarkResultUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BenchmarkResultPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one BenchmarkResult.
     * @param {BenchmarkResultUpsertArgs} args - Arguments to update or create a BenchmarkResult.
     * @example
     * // Update or create a BenchmarkResult
     * const benchmarkResult = await prisma.benchmarkResult.upsert({
     *   create: {
     *     // ... data to create a BenchmarkResult
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the BenchmarkResult we want to update
     *   }
     * })
     */
    upsert<T extends BenchmarkResultUpsertArgs>(args: SelectSubset<T, BenchmarkResultUpsertArgs<ExtArgs>>): Prisma__BenchmarkResultClient<$Result.GetResult<Prisma.$BenchmarkResultPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of BenchmarkResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BenchmarkResultCountArgs} args - Arguments to filter BenchmarkResults to count.
     * @example
     * // Count the number of BenchmarkResults
     * const count = await prisma.benchmarkResult.count({
     *   where: {
     *     // ... the filter for the BenchmarkResults we want to count
     *   }
     * })
    **/
    count<T extends BenchmarkResultCountArgs>(
      args?: Subset<T, BenchmarkResultCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BenchmarkResultCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a BenchmarkResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BenchmarkResultAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BenchmarkResultAggregateArgs>(args: Subset<T, BenchmarkResultAggregateArgs>): Prisma.PrismaPromise<GetBenchmarkResultAggregateType<T>>

    /**
     * Group by BenchmarkResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BenchmarkResultGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BenchmarkResultGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BenchmarkResultGroupByArgs['orderBy'] }
        : { orderBy?: BenchmarkResultGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BenchmarkResultGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBenchmarkResultGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the BenchmarkResult model
   */
  readonly fields: BenchmarkResultFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for BenchmarkResult.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BenchmarkResultClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends KnownFaceDefaultArgs<ExtArgs> = {}>(args?: Subset<T, KnownFaceDefaultArgs<ExtArgs>>): Prisma__KnownFaceClient<$Result.GetResult<Prisma.$KnownFacePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the BenchmarkResult model
   */
  interface BenchmarkResultFieldRefs {
    readonly id: FieldRef<"BenchmarkResult", 'BigInt'>
    readonly userId: FieldRef<"BenchmarkResult", 'String'>
    readonly faceApiAccuracy: FieldRef<"BenchmarkResult", 'Float'>
    readonly faceApiLatency: FieldRef<"BenchmarkResult", 'Float'>
    readonly arcfaceAccuracy: FieldRef<"BenchmarkResult", 'Float'>
    readonly arcfaceLatency: FieldRef<"BenchmarkResult", 'Float'>
    readonly testImage: FieldRef<"BenchmarkResult", 'String'>
    readonly createdAt: FieldRef<"BenchmarkResult", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * BenchmarkResult findUnique
   */
  export type BenchmarkResultFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultInclude<ExtArgs> | null
    /**
     * Filter, which BenchmarkResult to fetch.
     */
    where: BenchmarkResultWhereUniqueInput
  }

  /**
   * BenchmarkResult findUniqueOrThrow
   */
  export type BenchmarkResultFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultInclude<ExtArgs> | null
    /**
     * Filter, which BenchmarkResult to fetch.
     */
    where: BenchmarkResultWhereUniqueInput
  }

  /**
   * BenchmarkResult findFirst
   */
  export type BenchmarkResultFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultInclude<ExtArgs> | null
    /**
     * Filter, which BenchmarkResult to fetch.
     */
    where?: BenchmarkResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BenchmarkResults to fetch.
     */
    orderBy?: BenchmarkResultOrderByWithRelationInput | BenchmarkResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BenchmarkResults.
     */
    cursor?: BenchmarkResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BenchmarkResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BenchmarkResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BenchmarkResults.
     */
    distinct?: BenchmarkResultScalarFieldEnum | BenchmarkResultScalarFieldEnum[]
  }

  /**
   * BenchmarkResult findFirstOrThrow
   */
  export type BenchmarkResultFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultInclude<ExtArgs> | null
    /**
     * Filter, which BenchmarkResult to fetch.
     */
    where?: BenchmarkResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BenchmarkResults to fetch.
     */
    orderBy?: BenchmarkResultOrderByWithRelationInput | BenchmarkResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for BenchmarkResults.
     */
    cursor?: BenchmarkResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BenchmarkResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BenchmarkResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of BenchmarkResults.
     */
    distinct?: BenchmarkResultScalarFieldEnum | BenchmarkResultScalarFieldEnum[]
  }

  /**
   * BenchmarkResult findMany
   */
  export type BenchmarkResultFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultInclude<ExtArgs> | null
    /**
     * Filter, which BenchmarkResults to fetch.
     */
    where?: BenchmarkResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of BenchmarkResults to fetch.
     */
    orderBy?: BenchmarkResultOrderByWithRelationInput | BenchmarkResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing BenchmarkResults.
     */
    cursor?: BenchmarkResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` BenchmarkResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` BenchmarkResults.
     */
    skip?: number
    distinct?: BenchmarkResultScalarFieldEnum | BenchmarkResultScalarFieldEnum[]
  }

  /**
   * BenchmarkResult create
   */
  export type BenchmarkResultCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultInclude<ExtArgs> | null
    /**
     * The data needed to create a BenchmarkResult.
     */
    data: XOR<BenchmarkResultCreateInput, BenchmarkResultUncheckedCreateInput>
  }

  /**
   * BenchmarkResult createMany
   */
  export type BenchmarkResultCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many BenchmarkResults.
     */
    data: BenchmarkResultCreateManyInput | BenchmarkResultCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * BenchmarkResult createManyAndReturn
   */
  export type BenchmarkResultCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * The data used to create many BenchmarkResults.
     */
    data: BenchmarkResultCreateManyInput | BenchmarkResultCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * BenchmarkResult update
   */
  export type BenchmarkResultUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultInclude<ExtArgs> | null
    /**
     * The data needed to update a BenchmarkResult.
     */
    data: XOR<BenchmarkResultUpdateInput, BenchmarkResultUncheckedUpdateInput>
    /**
     * Choose, which BenchmarkResult to update.
     */
    where: BenchmarkResultWhereUniqueInput
  }

  /**
   * BenchmarkResult updateMany
   */
  export type BenchmarkResultUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update BenchmarkResults.
     */
    data: XOR<BenchmarkResultUpdateManyMutationInput, BenchmarkResultUncheckedUpdateManyInput>
    /**
     * Filter which BenchmarkResults to update
     */
    where?: BenchmarkResultWhereInput
    /**
     * Limit how many BenchmarkResults to update.
     */
    limit?: number
  }

  /**
   * BenchmarkResult updateManyAndReturn
   */
  export type BenchmarkResultUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * The data used to update BenchmarkResults.
     */
    data: XOR<BenchmarkResultUpdateManyMutationInput, BenchmarkResultUncheckedUpdateManyInput>
    /**
     * Filter which BenchmarkResults to update
     */
    where?: BenchmarkResultWhereInput
    /**
     * Limit how many BenchmarkResults to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * BenchmarkResult upsert
   */
  export type BenchmarkResultUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultInclude<ExtArgs> | null
    /**
     * The filter to search for the BenchmarkResult to update in case it exists.
     */
    where: BenchmarkResultWhereUniqueInput
    /**
     * In case the BenchmarkResult found by the `where` argument doesn't exist, create a new BenchmarkResult with this data.
     */
    create: XOR<BenchmarkResultCreateInput, BenchmarkResultUncheckedCreateInput>
    /**
     * In case the BenchmarkResult was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BenchmarkResultUpdateInput, BenchmarkResultUncheckedUpdateInput>
  }

  /**
   * BenchmarkResult delete
   */
  export type BenchmarkResultDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultInclude<ExtArgs> | null
    /**
     * Filter which BenchmarkResult to delete.
     */
    where: BenchmarkResultWhereUniqueInput
  }

  /**
   * BenchmarkResult deleteMany
   */
  export type BenchmarkResultDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which BenchmarkResults to delete
     */
    where?: BenchmarkResultWhereInput
    /**
     * Limit how many BenchmarkResults to delete.
     */
    limit?: number
  }

  /**
   * BenchmarkResult without action
   */
  export type BenchmarkResultDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the BenchmarkResult
     */
    select?: BenchmarkResultSelect<ExtArgs> | null
    /**
     * Omit specific fields from the BenchmarkResult
     */
    omit?: BenchmarkResultOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: BenchmarkResultInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const KnownFaceScalarFieldEnum: {
    id: 'id',
    name: 'name',
    faceApiDescriptor: 'faceApiDescriptor',
    arcfaceDescriptor: 'arcfaceDescriptor',
    enrollmentImages: 'enrollmentImages'
  };

  export type KnownFaceScalarFieldEnum = (typeof KnownFaceScalarFieldEnum)[keyof typeof KnownFaceScalarFieldEnum]


  export const AttendanceScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    similarity: 'similarity',
    latencyMs: 'latencyMs',
    model: 'model',
    createdAt: 'createdAt'
  };

  export type AttendanceScalarFieldEnum = (typeof AttendanceScalarFieldEnum)[keyof typeof AttendanceScalarFieldEnum]


  export const BenchmarkResultScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    faceApiAccuracy: 'faceApiAccuracy',
    faceApiLatency: 'faceApiLatency',
    arcfaceAccuracy: 'arcfaceAccuracy',
    arcfaceLatency: 'arcfaceLatency',
    testImage: 'testImage',
    createdAt: 'createdAt'
  };

  export type BenchmarkResultScalarFieldEnum = (typeof BenchmarkResultScalarFieldEnum)[keyof typeof BenchmarkResultScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const JsonNullValueInput: {
    JsonNull: typeof JsonNull
  };

  export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type KnownFaceWhereInput = {
    AND?: KnownFaceWhereInput | KnownFaceWhereInput[]
    OR?: KnownFaceWhereInput[]
    NOT?: KnownFaceWhereInput | KnownFaceWhereInput[]
    id?: StringFilter<"KnownFace"> | string
    name?: StringFilter<"KnownFace"> | string
    faceApiDescriptor?: FloatNullableListFilter<"KnownFace">
    arcfaceDescriptor?: FloatNullableListFilter<"KnownFace">
    enrollmentImages?: JsonFilter<"KnownFace">
    Attendance?: AttendanceListRelationFilter
    BenchmarkResults?: BenchmarkResultListRelationFilter
  }

  export type KnownFaceOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    faceApiDescriptor?: SortOrder
    arcfaceDescriptor?: SortOrder
    enrollmentImages?: SortOrder
    Attendance?: AttendanceOrderByRelationAggregateInput
    BenchmarkResults?: BenchmarkResultOrderByRelationAggregateInput
  }

  export type KnownFaceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: KnownFaceWhereInput | KnownFaceWhereInput[]
    OR?: KnownFaceWhereInput[]
    NOT?: KnownFaceWhereInput | KnownFaceWhereInput[]
    name?: StringFilter<"KnownFace"> | string
    faceApiDescriptor?: FloatNullableListFilter<"KnownFace">
    arcfaceDescriptor?: FloatNullableListFilter<"KnownFace">
    enrollmentImages?: JsonFilter<"KnownFace">
    Attendance?: AttendanceListRelationFilter
    BenchmarkResults?: BenchmarkResultListRelationFilter
  }, "id">

  export type KnownFaceOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    faceApiDescriptor?: SortOrder
    arcfaceDescriptor?: SortOrder
    enrollmentImages?: SortOrder
    _count?: KnownFaceCountOrderByAggregateInput
    _avg?: KnownFaceAvgOrderByAggregateInput
    _max?: KnownFaceMaxOrderByAggregateInput
    _min?: KnownFaceMinOrderByAggregateInput
    _sum?: KnownFaceSumOrderByAggregateInput
  }

  export type KnownFaceScalarWhereWithAggregatesInput = {
    AND?: KnownFaceScalarWhereWithAggregatesInput | KnownFaceScalarWhereWithAggregatesInput[]
    OR?: KnownFaceScalarWhereWithAggregatesInput[]
    NOT?: KnownFaceScalarWhereWithAggregatesInput | KnownFaceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"KnownFace"> | string
    name?: StringWithAggregatesFilter<"KnownFace"> | string
    faceApiDescriptor?: FloatNullableListFilter<"KnownFace">
    arcfaceDescriptor?: FloatNullableListFilter<"KnownFace">
    enrollmentImages?: JsonWithAggregatesFilter<"KnownFace">
  }

  export type AttendanceWhereInput = {
    AND?: AttendanceWhereInput | AttendanceWhereInput[]
    OR?: AttendanceWhereInput[]
    NOT?: AttendanceWhereInput | AttendanceWhereInput[]
    id?: BigIntFilter<"Attendance"> | bigint | number
    userId?: StringFilter<"Attendance"> | string
    similarity?: FloatFilter<"Attendance"> | number
    latencyMs?: FloatFilter<"Attendance"> | number
    model?: StringFilter<"Attendance"> | string
    createdAt?: DateTimeFilter<"Attendance"> | Date | string
    user?: XOR<KnownFaceScalarRelationFilter, KnownFaceWhereInput>
  }

  export type AttendanceOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    similarity?: SortOrder
    latencyMs?: SortOrder
    model?: SortOrder
    createdAt?: SortOrder
    user?: KnownFaceOrderByWithRelationInput
  }

  export type AttendanceWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: AttendanceWhereInput | AttendanceWhereInput[]
    OR?: AttendanceWhereInput[]
    NOT?: AttendanceWhereInput | AttendanceWhereInput[]
    userId?: StringFilter<"Attendance"> | string
    similarity?: FloatFilter<"Attendance"> | number
    latencyMs?: FloatFilter<"Attendance"> | number
    model?: StringFilter<"Attendance"> | string
    createdAt?: DateTimeFilter<"Attendance"> | Date | string
    user?: XOR<KnownFaceScalarRelationFilter, KnownFaceWhereInput>
  }, "id">

  export type AttendanceOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    similarity?: SortOrder
    latencyMs?: SortOrder
    model?: SortOrder
    createdAt?: SortOrder
    _count?: AttendanceCountOrderByAggregateInput
    _avg?: AttendanceAvgOrderByAggregateInput
    _max?: AttendanceMaxOrderByAggregateInput
    _min?: AttendanceMinOrderByAggregateInput
    _sum?: AttendanceSumOrderByAggregateInput
  }

  export type AttendanceScalarWhereWithAggregatesInput = {
    AND?: AttendanceScalarWhereWithAggregatesInput | AttendanceScalarWhereWithAggregatesInput[]
    OR?: AttendanceScalarWhereWithAggregatesInput[]
    NOT?: AttendanceScalarWhereWithAggregatesInput | AttendanceScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"Attendance"> | bigint | number
    userId?: StringWithAggregatesFilter<"Attendance"> | string
    similarity?: FloatWithAggregatesFilter<"Attendance"> | number
    latencyMs?: FloatWithAggregatesFilter<"Attendance"> | number
    model?: StringWithAggregatesFilter<"Attendance"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Attendance"> | Date | string
  }

  export type BenchmarkResultWhereInput = {
    AND?: BenchmarkResultWhereInput | BenchmarkResultWhereInput[]
    OR?: BenchmarkResultWhereInput[]
    NOT?: BenchmarkResultWhereInput | BenchmarkResultWhereInput[]
    id?: BigIntFilter<"BenchmarkResult"> | bigint | number
    userId?: StringFilter<"BenchmarkResult"> | string
    faceApiAccuracy?: FloatNullableFilter<"BenchmarkResult"> | number | null
    faceApiLatency?: FloatNullableFilter<"BenchmarkResult"> | number | null
    arcfaceAccuracy?: FloatNullableFilter<"BenchmarkResult"> | number | null
    arcfaceLatency?: FloatNullableFilter<"BenchmarkResult"> | number | null
    testImage?: StringFilter<"BenchmarkResult"> | string
    createdAt?: DateTimeFilter<"BenchmarkResult"> | Date | string
    user?: XOR<KnownFaceScalarRelationFilter, KnownFaceWhereInput>
  }

  export type BenchmarkResultOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    faceApiAccuracy?: SortOrderInput | SortOrder
    faceApiLatency?: SortOrderInput | SortOrder
    arcfaceAccuracy?: SortOrderInput | SortOrder
    arcfaceLatency?: SortOrderInput | SortOrder
    testImage?: SortOrder
    createdAt?: SortOrder
    user?: KnownFaceOrderByWithRelationInput
  }

  export type BenchmarkResultWhereUniqueInput = Prisma.AtLeast<{
    id?: bigint | number
    AND?: BenchmarkResultWhereInput | BenchmarkResultWhereInput[]
    OR?: BenchmarkResultWhereInput[]
    NOT?: BenchmarkResultWhereInput | BenchmarkResultWhereInput[]
    userId?: StringFilter<"BenchmarkResult"> | string
    faceApiAccuracy?: FloatNullableFilter<"BenchmarkResult"> | number | null
    faceApiLatency?: FloatNullableFilter<"BenchmarkResult"> | number | null
    arcfaceAccuracy?: FloatNullableFilter<"BenchmarkResult"> | number | null
    arcfaceLatency?: FloatNullableFilter<"BenchmarkResult"> | number | null
    testImage?: StringFilter<"BenchmarkResult"> | string
    createdAt?: DateTimeFilter<"BenchmarkResult"> | Date | string
    user?: XOR<KnownFaceScalarRelationFilter, KnownFaceWhereInput>
  }, "id">

  export type BenchmarkResultOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    faceApiAccuracy?: SortOrderInput | SortOrder
    faceApiLatency?: SortOrderInput | SortOrder
    arcfaceAccuracy?: SortOrderInput | SortOrder
    arcfaceLatency?: SortOrderInput | SortOrder
    testImage?: SortOrder
    createdAt?: SortOrder
    _count?: BenchmarkResultCountOrderByAggregateInput
    _avg?: BenchmarkResultAvgOrderByAggregateInput
    _max?: BenchmarkResultMaxOrderByAggregateInput
    _min?: BenchmarkResultMinOrderByAggregateInput
    _sum?: BenchmarkResultSumOrderByAggregateInput
  }

  export type BenchmarkResultScalarWhereWithAggregatesInput = {
    AND?: BenchmarkResultScalarWhereWithAggregatesInput | BenchmarkResultScalarWhereWithAggregatesInput[]
    OR?: BenchmarkResultScalarWhereWithAggregatesInput[]
    NOT?: BenchmarkResultScalarWhereWithAggregatesInput | BenchmarkResultScalarWhereWithAggregatesInput[]
    id?: BigIntWithAggregatesFilter<"BenchmarkResult"> | bigint | number
    userId?: StringWithAggregatesFilter<"BenchmarkResult"> | string
    faceApiAccuracy?: FloatNullableWithAggregatesFilter<"BenchmarkResult"> | number | null
    faceApiLatency?: FloatNullableWithAggregatesFilter<"BenchmarkResult"> | number | null
    arcfaceAccuracy?: FloatNullableWithAggregatesFilter<"BenchmarkResult"> | number | null
    arcfaceLatency?: FloatNullableWithAggregatesFilter<"BenchmarkResult"> | number | null
    testImage?: StringWithAggregatesFilter<"BenchmarkResult"> | string
    createdAt?: DateTimeWithAggregatesFilter<"BenchmarkResult"> | Date | string
  }

  export type KnownFaceCreateInput = {
    id?: string
    name: string
    faceApiDescriptor?: KnownFaceCreatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceCreatearcfaceDescriptorInput | number[]
    enrollmentImages: JsonNullValueInput | InputJsonValue
    Attendance?: AttendanceCreateNestedManyWithoutUserInput
    BenchmarkResults?: BenchmarkResultCreateNestedManyWithoutUserInput
  }

  export type KnownFaceUncheckedCreateInput = {
    id?: string
    name: string
    faceApiDescriptor?: KnownFaceCreatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceCreatearcfaceDescriptorInput | number[]
    enrollmentImages: JsonNullValueInput | InputJsonValue
    Attendance?: AttendanceUncheckedCreateNestedManyWithoutUserInput
    BenchmarkResults?: BenchmarkResultUncheckedCreateNestedManyWithoutUserInput
  }

  export type KnownFaceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    faceApiDescriptor?: KnownFaceUpdatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceUpdatearcfaceDescriptorInput | number[]
    enrollmentImages?: JsonNullValueInput | InputJsonValue
    Attendance?: AttendanceUpdateManyWithoutUserNestedInput
    BenchmarkResults?: BenchmarkResultUpdateManyWithoutUserNestedInput
  }

  export type KnownFaceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    faceApiDescriptor?: KnownFaceUpdatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceUpdatearcfaceDescriptorInput | number[]
    enrollmentImages?: JsonNullValueInput | InputJsonValue
    Attendance?: AttendanceUncheckedUpdateManyWithoutUserNestedInput
    BenchmarkResults?: BenchmarkResultUncheckedUpdateManyWithoutUserNestedInput
  }

  export type KnownFaceCreateManyInput = {
    id?: string
    name: string
    faceApiDescriptor?: KnownFaceCreatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceCreatearcfaceDescriptorInput | number[]
    enrollmentImages: JsonNullValueInput | InputJsonValue
  }

  export type KnownFaceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    faceApiDescriptor?: KnownFaceUpdatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceUpdatearcfaceDescriptorInput | number[]
    enrollmentImages?: JsonNullValueInput | InputJsonValue
  }

  export type KnownFaceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    faceApiDescriptor?: KnownFaceUpdatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceUpdatearcfaceDescriptorInput | number[]
    enrollmentImages?: JsonNullValueInput | InputJsonValue
  }

  export type AttendanceCreateInput = {
    id?: bigint | number
    similarity: number
    latencyMs: number
    model?: string
    createdAt?: Date | string
    user: KnownFaceCreateNestedOneWithoutAttendanceInput
  }

  export type AttendanceUncheckedCreateInput = {
    id?: bigint | number
    userId: string
    similarity: number
    latencyMs: number
    model?: string
    createdAt?: Date | string
  }

  export type AttendanceUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    similarity?: FloatFieldUpdateOperationsInput | number
    latencyMs?: FloatFieldUpdateOperationsInput | number
    model?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: KnownFaceUpdateOneRequiredWithoutAttendanceNestedInput
  }

  export type AttendanceUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    userId?: StringFieldUpdateOperationsInput | string
    similarity?: FloatFieldUpdateOperationsInput | number
    latencyMs?: FloatFieldUpdateOperationsInput | number
    model?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceCreateManyInput = {
    id?: bigint | number
    userId: string
    similarity: number
    latencyMs: number
    model?: string
    createdAt?: Date | string
  }

  export type AttendanceUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    similarity?: FloatFieldUpdateOperationsInput | number
    latencyMs?: FloatFieldUpdateOperationsInput | number
    model?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    userId?: StringFieldUpdateOperationsInput | string
    similarity?: FloatFieldUpdateOperationsInput | number
    latencyMs?: FloatFieldUpdateOperationsInput | number
    model?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BenchmarkResultCreateInput = {
    id?: bigint | number
    faceApiAccuracy?: number | null
    faceApiLatency?: number | null
    arcfaceAccuracy?: number | null
    arcfaceLatency?: number | null
    testImage: string
    createdAt?: Date | string
    user: KnownFaceCreateNestedOneWithoutBenchmarkResultsInput
  }

  export type BenchmarkResultUncheckedCreateInput = {
    id?: bigint | number
    userId: string
    faceApiAccuracy?: number | null
    faceApiLatency?: number | null
    arcfaceAccuracy?: number | null
    arcfaceLatency?: number | null
    testImage: string
    createdAt?: Date | string
  }

  export type BenchmarkResultUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    faceApiAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    faceApiLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    testImage?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: KnownFaceUpdateOneRequiredWithoutBenchmarkResultsNestedInput
  }

  export type BenchmarkResultUncheckedUpdateInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    userId?: StringFieldUpdateOperationsInput | string
    faceApiAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    faceApiLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    testImage?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BenchmarkResultCreateManyInput = {
    id?: bigint | number
    userId: string
    faceApiAccuracy?: number | null
    faceApiLatency?: number | null
    arcfaceAccuracy?: number | null
    arcfaceLatency?: number | null
    testImage: string
    createdAt?: Date | string
  }

  export type BenchmarkResultUpdateManyMutationInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    faceApiAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    faceApiLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    testImage?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BenchmarkResultUncheckedUpdateManyInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    userId?: StringFieldUpdateOperationsInput | string
    faceApiAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    faceApiLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    testImage?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type FloatNullableListFilter<$PrismaModel = never> = {
    equals?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    has?: number | FloatFieldRefInput<$PrismaModel> | null
    hasEvery?: number[] | ListFloatFieldRefInput<$PrismaModel>
    hasSome?: number[] | ListFloatFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }
  export type JsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonFilterBase<$PrismaModel>>, 'path'>>

  export type JsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type AttendanceListRelationFilter = {
    every?: AttendanceWhereInput
    some?: AttendanceWhereInput
    none?: AttendanceWhereInput
  }

  export type BenchmarkResultListRelationFilter = {
    every?: BenchmarkResultWhereInput
    some?: BenchmarkResultWhereInput
    none?: BenchmarkResultWhereInput
  }

  export type AttendanceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type BenchmarkResultOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type KnownFaceCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    faceApiDescriptor?: SortOrder
    arcfaceDescriptor?: SortOrder
    enrollmentImages?: SortOrder
  }

  export type KnownFaceAvgOrderByAggregateInput = {
    faceApiDescriptor?: SortOrder
    arcfaceDescriptor?: SortOrder
  }

  export type KnownFaceMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type KnownFaceMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
  }

  export type KnownFaceSumOrderByAggregateInput = {
    faceApiDescriptor?: SortOrder
    arcfaceDescriptor?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }
  export type JsonWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedJsonFilter<$PrismaModel>
    _max?: NestedJsonFilter<$PrismaModel>
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type KnownFaceScalarRelationFilter = {
    is?: KnownFaceWhereInput
    isNot?: KnownFaceWhereInput
  }

  export type AttendanceCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    similarity?: SortOrder
    latencyMs?: SortOrder
    model?: SortOrder
    createdAt?: SortOrder
  }

  export type AttendanceAvgOrderByAggregateInput = {
    id?: SortOrder
    similarity?: SortOrder
    latencyMs?: SortOrder
  }

  export type AttendanceMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    similarity?: SortOrder
    latencyMs?: SortOrder
    model?: SortOrder
    createdAt?: SortOrder
  }

  export type AttendanceMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    similarity?: SortOrder
    latencyMs?: SortOrder
    model?: SortOrder
    createdAt?: SortOrder
  }

  export type AttendanceSumOrderByAggregateInput = {
    id?: SortOrder
    similarity?: SortOrder
    latencyMs?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type BenchmarkResultCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    faceApiAccuracy?: SortOrder
    faceApiLatency?: SortOrder
    arcfaceAccuracy?: SortOrder
    arcfaceLatency?: SortOrder
    testImage?: SortOrder
    createdAt?: SortOrder
  }

  export type BenchmarkResultAvgOrderByAggregateInput = {
    id?: SortOrder
    faceApiAccuracy?: SortOrder
    faceApiLatency?: SortOrder
    arcfaceAccuracy?: SortOrder
    arcfaceLatency?: SortOrder
  }

  export type BenchmarkResultMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    faceApiAccuracy?: SortOrder
    faceApiLatency?: SortOrder
    arcfaceAccuracy?: SortOrder
    arcfaceLatency?: SortOrder
    testImage?: SortOrder
    createdAt?: SortOrder
  }

  export type BenchmarkResultMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    faceApiAccuracy?: SortOrder
    faceApiLatency?: SortOrder
    arcfaceAccuracy?: SortOrder
    arcfaceLatency?: SortOrder
    testImage?: SortOrder
    createdAt?: SortOrder
  }

  export type BenchmarkResultSumOrderByAggregateInput = {
    id?: SortOrder
    faceApiAccuracy?: SortOrder
    faceApiLatency?: SortOrder
    arcfaceAccuracy?: SortOrder
    arcfaceLatency?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type KnownFaceCreatefaceApiDescriptorInput = {
    set: number[]
  }

  export type KnownFaceCreatearcfaceDescriptorInput = {
    set: number[]
  }

  export type AttendanceCreateNestedManyWithoutUserInput = {
    create?: XOR<AttendanceCreateWithoutUserInput, AttendanceUncheckedCreateWithoutUserInput> | AttendanceCreateWithoutUserInput[] | AttendanceUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutUserInput | AttendanceCreateOrConnectWithoutUserInput[]
    createMany?: AttendanceCreateManyUserInputEnvelope
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
  }

  export type BenchmarkResultCreateNestedManyWithoutUserInput = {
    create?: XOR<BenchmarkResultCreateWithoutUserInput, BenchmarkResultUncheckedCreateWithoutUserInput> | BenchmarkResultCreateWithoutUserInput[] | BenchmarkResultUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BenchmarkResultCreateOrConnectWithoutUserInput | BenchmarkResultCreateOrConnectWithoutUserInput[]
    createMany?: BenchmarkResultCreateManyUserInputEnvelope
    connect?: BenchmarkResultWhereUniqueInput | BenchmarkResultWhereUniqueInput[]
  }

  export type AttendanceUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<AttendanceCreateWithoutUserInput, AttendanceUncheckedCreateWithoutUserInput> | AttendanceCreateWithoutUserInput[] | AttendanceUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutUserInput | AttendanceCreateOrConnectWithoutUserInput[]
    createMany?: AttendanceCreateManyUserInputEnvelope
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
  }

  export type BenchmarkResultUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<BenchmarkResultCreateWithoutUserInput, BenchmarkResultUncheckedCreateWithoutUserInput> | BenchmarkResultCreateWithoutUserInput[] | BenchmarkResultUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BenchmarkResultCreateOrConnectWithoutUserInput | BenchmarkResultCreateOrConnectWithoutUserInput[]
    createMany?: BenchmarkResultCreateManyUserInputEnvelope
    connect?: BenchmarkResultWhereUniqueInput | BenchmarkResultWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type KnownFaceUpdatefaceApiDescriptorInput = {
    set?: number[]
    push?: number | number[]
  }

  export type KnownFaceUpdatearcfaceDescriptorInput = {
    set?: number[]
    push?: number | number[]
  }

  export type AttendanceUpdateManyWithoutUserNestedInput = {
    create?: XOR<AttendanceCreateWithoutUserInput, AttendanceUncheckedCreateWithoutUserInput> | AttendanceCreateWithoutUserInput[] | AttendanceUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutUserInput | AttendanceCreateOrConnectWithoutUserInput[]
    upsert?: AttendanceUpsertWithWhereUniqueWithoutUserInput | AttendanceUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AttendanceCreateManyUserInputEnvelope
    set?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    disconnect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    delete?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    update?: AttendanceUpdateWithWhereUniqueWithoutUserInput | AttendanceUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AttendanceUpdateManyWithWhereWithoutUserInput | AttendanceUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
  }

  export type BenchmarkResultUpdateManyWithoutUserNestedInput = {
    create?: XOR<BenchmarkResultCreateWithoutUserInput, BenchmarkResultUncheckedCreateWithoutUserInput> | BenchmarkResultCreateWithoutUserInput[] | BenchmarkResultUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BenchmarkResultCreateOrConnectWithoutUserInput | BenchmarkResultCreateOrConnectWithoutUserInput[]
    upsert?: BenchmarkResultUpsertWithWhereUniqueWithoutUserInput | BenchmarkResultUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: BenchmarkResultCreateManyUserInputEnvelope
    set?: BenchmarkResultWhereUniqueInput | BenchmarkResultWhereUniqueInput[]
    disconnect?: BenchmarkResultWhereUniqueInput | BenchmarkResultWhereUniqueInput[]
    delete?: BenchmarkResultWhereUniqueInput | BenchmarkResultWhereUniqueInput[]
    connect?: BenchmarkResultWhereUniqueInput | BenchmarkResultWhereUniqueInput[]
    update?: BenchmarkResultUpdateWithWhereUniqueWithoutUserInput | BenchmarkResultUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: BenchmarkResultUpdateManyWithWhereWithoutUserInput | BenchmarkResultUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: BenchmarkResultScalarWhereInput | BenchmarkResultScalarWhereInput[]
  }

  export type AttendanceUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<AttendanceCreateWithoutUserInput, AttendanceUncheckedCreateWithoutUserInput> | AttendanceCreateWithoutUserInput[] | AttendanceUncheckedCreateWithoutUserInput[]
    connectOrCreate?: AttendanceCreateOrConnectWithoutUserInput | AttendanceCreateOrConnectWithoutUserInput[]
    upsert?: AttendanceUpsertWithWhereUniqueWithoutUserInput | AttendanceUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: AttendanceCreateManyUserInputEnvelope
    set?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    disconnect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    delete?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    connect?: AttendanceWhereUniqueInput | AttendanceWhereUniqueInput[]
    update?: AttendanceUpdateWithWhereUniqueWithoutUserInput | AttendanceUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: AttendanceUpdateManyWithWhereWithoutUserInput | AttendanceUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
  }

  export type BenchmarkResultUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<BenchmarkResultCreateWithoutUserInput, BenchmarkResultUncheckedCreateWithoutUserInput> | BenchmarkResultCreateWithoutUserInput[] | BenchmarkResultUncheckedCreateWithoutUserInput[]
    connectOrCreate?: BenchmarkResultCreateOrConnectWithoutUserInput | BenchmarkResultCreateOrConnectWithoutUserInput[]
    upsert?: BenchmarkResultUpsertWithWhereUniqueWithoutUserInput | BenchmarkResultUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: BenchmarkResultCreateManyUserInputEnvelope
    set?: BenchmarkResultWhereUniqueInput | BenchmarkResultWhereUniqueInput[]
    disconnect?: BenchmarkResultWhereUniqueInput | BenchmarkResultWhereUniqueInput[]
    delete?: BenchmarkResultWhereUniqueInput | BenchmarkResultWhereUniqueInput[]
    connect?: BenchmarkResultWhereUniqueInput | BenchmarkResultWhereUniqueInput[]
    update?: BenchmarkResultUpdateWithWhereUniqueWithoutUserInput | BenchmarkResultUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: BenchmarkResultUpdateManyWithWhereWithoutUserInput | BenchmarkResultUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: BenchmarkResultScalarWhereInput | BenchmarkResultScalarWhereInput[]
  }

  export type KnownFaceCreateNestedOneWithoutAttendanceInput = {
    create?: XOR<KnownFaceCreateWithoutAttendanceInput, KnownFaceUncheckedCreateWithoutAttendanceInput>
    connectOrCreate?: KnownFaceCreateOrConnectWithoutAttendanceInput
    connect?: KnownFaceWhereUniqueInput
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type KnownFaceUpdateOneRequiredWithoutAttendanceNestedInput = {
    create?: XOR<KnownFaceCreateWithoutAttendanceInput, KnownFaceUncheckedCreateWithoutAttendanceInput>
    connectOrCreate?: KnownFaceCreateOrConnectWithoutAttendanceInput
    upsert?: KnownFaceUpsertWithoutAttendanceInput
    connect?: KnownFaceWhereUniqueInput
    update?: XOR<XOR<KnownFaceUpdateToOneWithWhereWithoutAttendanceInput, KnownFaceUpdateWithoutAttendanceInput>, KnownFaceUncheckedUpdateWithoutAttendanceInput>
  }

  export type KnownFaceCreateNestedOneWithoutBenchmarkResultsInput = {
    create?: XOR<KnownFaceCreateWithoutBenchmarkResultsInput, KnownFaceUncheckedCreateWithoutBenchmarkResultsInput>
    connectOrCreate?: KnownFaceCreateOrConnectWithoutBenchmarkResultsInput
    connect?: KnownFaceWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type KnownFaceUpdateOneRequiredWithoutBenchmarkResultsNestedInput = {
    create?: XOR<KnownFaceCreateWithoutBenchmarkResultsInput, KnownFaceUncheckedCreateWithoutBenchmarkResultsInput>
    connectOrCreate?: KnownFaceCreateOrConnectWithoutBenchmarkResultsInput
    upsert?: KnownFaceUpsertWithoutBenchmarkResultsInput
    connect?: KnownFaceWhereUniqueInput
    update?: XOR<XOR<KnownFaceUpdateToOneWithWhereWithoutBenchmarkResultsInput, KnownFaceUpdateWithoutBenchmarkResultsInput>, KnownFaceUncheckedUpdateWithoutBenchmarkResultsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }
  export type NestedJsonFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type AttendanceCreateWithoutUserInput = {
    id?: bigint | number
    similarity: number
    latencyMs: number
    model?: string
    createdAt?: Date | string
  }

  export type AttendanceUncheckedCreateWithoutUserInput = {
    id?: bigint | number
    similarity: number
    latencyMs: number
    model?: string
    createdAt?: Date | string
  }

  export type AttendanceCreateOrConnectWithoutUserInput = {
    where: AttendanceWhereUniqueInput
    create: XOR<AttendanceCreateWithoutUserInput, AttendanceUncheckedCreateWithoutUserInput>
  }

  export type AttendanceCreateManyUserInputEnvelope = {
    data: AttendanceCreateManyUserInput | AttendanceCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type BenchmarkResultCreateWithoutUserInput = {
    id?: bigint | number
    faceApiAccuracy?: number | null
    faceApiLatency?: number | null
    arcfaceAccuracy?: number | null
    arcfaceLatency?: number | null
    testImage: string
    createdAt?: Date | string
  }

  export type BenchmarkResultUncheckedCreateWithoutUserInput = {
    id?: bigint | number
    faceApiAccuracy?: number | null
    faceApiLatency?: number | null
    arcfaceAccuracy?: number | null
    arcfaceLatency?: number | null
    testImage: string
    createdAt?: Date | string
  }

  export type BenchmarkResultCreateOrConnectWithoutUserInput = {
    where: BenchmarkResultWhereUniqueInput
    create: XOR<BenchmarkResultCreateWithoutUserInput, BenchmarkResultUncheckedCreateWithoutUserInput>
  }

  export type BenchmarkResultCreateManyUserInputEnvelope = {
    data: BenchmarkResultCreateManyUserInput | BenchmarkResultCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type AttendanceUpsertWithWhereUniqueWithoutUserInput = {
    where: AttendanceWhereUniqueInput
    update: XOR<AttendanceUpdateWithoutUserInput, AttendanceUncheckedUpdateWithoutUserInput>
    create: XOR<AttendanceCreateWithoutUserInput, AttendanceUncheckedCreateWithoutUserInput>
  }

  export type AttendanceUpdateWithWhereUniqueWithoutUserInput = {
    where: AttendanceWhereUniqueInput
    data: XOR<AttendanceUpdateWithoutUserInput, AttendanceUncheckedUpdateWithoutUserInput>
  }

  export type AttendanceUpdateManyWithWhereWithoutUserInput = {
    where: AttendanceScalarWhereInput
    data: XOR<AttendanceUpdateManyMutationInput, AttendanceUncheckedUpdateManyWithoutUserInput>
  }

  export type AttendanceScalarWhereInput = {
    AND?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
    OR?: AttendanceScalarWhereInput[]
    NOT?: AttendanceScalarWhereInput | AttendanceScalarWhereInput[]
    id?: BigIntFilter<"Attendance"> | bigint | number
    userId?: StringFilter<"Attendance"> | string
    similarity?: FloatFilter<"Attendance"> | number
    latencyMs?: FloatFilter<"Attendance"> | number
    model?: StringFilter<"Attendance"> | string
    createdAt?: DateTimeFilter<"Attendance"> | Date | string
  }

  export type BenchmarkResultUpsertWithWhereUniqueWithoutUserInput = {
    where: BenchmarkResultWhereUniqueInput
    update: XOR<BenchmarkResultUpdateWithoutUserInput, BenchmarkResultUncheckedUpdateWithoutUserInput>
    create: XOR<BenchmarkResultCreateWithoutUserInput, BenchmarkResultUncheckedCreateWithoutUserInput>
  }

  export type BenchmarkResultUpdateWithWhereUniqueWithoutUserInput = {
    where: BenchmarkResultWhereUniqueInput
    data: XOR<BenchmarkResultUpdateWithoutUserInput, BenchmarkResultUncheckedUpdateWithoutUserInput>
  }

  export type BenchmarkResultUpdateManyWithWhereWithoutUserInput = {
    where: BenchmarkResultScalarWhereInput
    data: XOR<BenchmarkResultUpdateManyMutationInput, BenchmarkResultUncheckedUpdateManyWithoutUserInput>
  }

  export type BenchmarkResultScalarWhereInput = {
    AND?: BenchmarkResultScalarWhereInput | BenchmarkResultScalarWhereInput[]
    OR?: BenchmarkResultScalarWhereInput[]
    NOT?: BenchmarkResultScalarWhereInput | BenchmarkResultScalarWhereInput[]
    id?: BigIntFilter<"BenchmarkResult"> | bigint | number
    userId?: StringFilter<"BenchmarkResult"> | string
    faceApiAccuracy?: FloatNullableFilter<"BenchmarkResult"> | number | null
    faceApiLatency?: FloatNullableFilter<"BenchmarkResult"> | number | null
    arcfaceAccuracy?: FloatNullableFilter<"BenchmarkResult"> | number | null
    arcfaceLatency?: FloatNullableFilter<"BenchmarkResult"> | number | null
    testImage?: StringFilter<"BenchmarkResult"> | string
    createdAt?: DateTimeFilter<"BenchmarkResult"> | Date | string
  }

  export type KnownFaceCreateWithoutAttendanceInput = {
    id?: string
    name: string
    faceApiDescriptor?: KnownFaceCreatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceCreatearcfaceDescriptorInput | number[]
    enrollmentImages: JsonNullValueInput | InputJsonValue
    BenchmarkResults?: BenchmarkResultCreateNestedManyWithoutUserInput
  }

  export type KnownFaceUncheckedCreateWithoutAttendanceInput = {
    id?: string
    name: string
    faceApiDescriptor?: KnownFaceCreatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceCreatearcfaceDescriptorInput | number[]
    enrollmentImages: JsonNullValueInput | InputJsonValue
    BenchmarkResults?: BenchmarkResultUncheckedCreateNestedManyWithoutUserInput
  }

  export type KnownFaceCreateOrConnectWithoutAttendanceInput = {
    where: KnownFaceWhereUniqueInput
    create: XOR<KnownFaceCreateWithoutAttendanceInput, KnownFaceUncheckedCreateWithoutAttendanceInput>
  }

  export type KnownFaceUpsertWithoutAttendanceInput = {
    update: XOR<KnownFaceUpdateWithoutAttendanceInput, KnownFaceUncheckedUpdateWithoutAttendanceInput>
    create: XOR<KnownFaceCreateWithoutAttendanceInput, KnownFaceUncheckedCreateWithoutAttendanceInput>
    where?: KnownFaceWhereInput
  }

  export type KnownFaceUpdateToOneWithWhereWithoutAttendanceInput = {
    where?: KnownFaceWhereInput
    data: XOR<KnownFaceUpdateWithoutAttendanceInput, KnownFaceUncheckedUpdateWithoutAttendanceInput>
  }

  export type KnownFaceUpdateWithoutAttendanceInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    faceApiDescriptor?: KnownFaceUpdatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceUpdatearcfaceDescriptorInput | number[]
    enrollmentImages?: JsonNullValueInput | InputJsonValue
    BenchmarkResults?: BenchmarkResultUpdateManyWithoutUserNestedInput
  }

  export type KnownFaceUncheckedUpdateWithoutAttendanceInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    faceApiDescriptor?: KnownFaceUpdatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceUpdatearcfaceDescriptorInput | number[]
    enrollmentImages?: JsonNullValueInput | InputJsonValue
    BenchmarkResults?: BenchmarkResultUncheckedUpdateManyWithoutUserNestedInput
  }

  export type KnownFaceCreateWithoutBenchmarkResultsInput = {
    id?: string
    name: string
    faceApiDescriptor?: KnownFaceCreatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceCreatearcfaceDescriptorInput | number[]
    enrollmentImages: JsonNullValueInput | InputJsonValue
    Attendance?: AttendanceCreateNestedManyWithoutUserInput
  }

  export type KnownFaceUncheckedCreateWithoutBenchmarkResultsInput = {
    id?: string
    name: string
    faceApiDescriptor?: KnownFaceCreatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceCreatearcfaceDescriptorInput | number[]
    enrollmentImages: JsonNullValueInput | InputJsonValue
    Attendance?: AttendanceUncheckedCreateNestedManyWithoutUserInput
  }

  export type KnownFaceCreateOrConnectWithoutBenchmarkResultsInput = {
    where: KnownFaceWhereUniqueInput
    create: XOR<KnownFaceCreateWithoutBenchmarkResultsInput, KnownFaceUncheckedCreateWithoutBenchmarkResultsInput>
  }

  export type KnownFaceUpsertWithoutBenchmarkResultsInput = {
    update: XOR<KnownFaceUpdateWithoutBenchmarkResultsInput, KnownFaceUncheckedUpdateWithoutBenchmarkResultsInput>
    create: XOR<KnownFaceCreateWithoutBenchmarkResultsInput, KnownFaceUncheckedCreateWithoutBenchmarkResultsInput>
    where?: KnownFaceWhereInput
  }

  export type KnownFaceUpdateToOneWithWhereWithoutBenchmarkResultsInput = {
    where?: KnownFaceWhereInput
    data: XOR<KnownFaceUpdateWithoutBenchmarkResultsInput, KnownFaceUncheckedUpdateWithoutBenchmarkResultsInput>
  }

  export type KnownFaceUpdateWithoutBenchmarkResultsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    faceApiDescriptor?: KnownFaceUpdatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceUpdatearcfaceDescriptorInput | number[]
    enrollmentImages?: JsonNullValueInput | InputJsonValue
    Attendance?: AttendanceUpdateManyWithoutUserNestedInput
  }

  export type KnownFaceUncheckedUpdateWithoutBenchmarkResultsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    faceApiDescriptor?: KnownFaceUpdatefaceApiDescriptorInput | number[]
    arcfaceDescriptor?: KnownFaceUpdatearcfaceDescriptorInput | number[]
    enrollmentImages?: JsonNullValueInput | InputJsonValue
    Attendance?: AttendanceUncheckedUpdateManyWithoutUserNestedInput
  }

  export type AttendanceCreateManyUserInput = {
    id?: bigint | number
    similarity: number
    latencyMs: number
    model?: string
    createdAt?: Date | string
  }

  export type BenchmarkResultCreateManyUserInput = {
    id?: bigint | number
    faceApiAccuracy?: number | null
    faceApiLatency?: number | null
    arcfaceAccuracy?: number | null
    arcfaceLatency?: number | null
    testImage: string
    createdAt?: Date | string
  }

  export type AttendanceUpdateWithoutUserInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    similarity?: FloatFieldUpdateOperationsInput | number
    latencyMs?: FloatFieldUpdateOperationsInput | number
    model?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUncheckedUpdateWithoutUserInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    similarity?: FloatFieldUpdateOperationsInput | number
    latencyMs?: FloatFieldUpdateOperationsInput | number
    model?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceUncheckedUpdateManyWithoutUserInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    similarity?: FloatFieldUpdateOperationsInput | number
    latencyMs?: FloatFieldUpdateOperationsInput | number
    model?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BenchmarkResultUpdateWithoutUserInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    faceApiAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    faceApiLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    testImage?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BenchmarkResultUncheckedUpdateWithoutUserInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    faceApiAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    faceApiLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    testImage?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BenchmarkResultUncheckedUpdateManyWithoutUserInput = {
    id?: BigIntFieldUpdateOperationsInput | bigint | number
    faceApiAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    faceApiLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceAccuracy?: NullableFloatFieldUpdateOperationsInput | number | null
    arcfaceLatency?: NullableFloatFieldUpdateOperationsInput | number | null
    testImage?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}