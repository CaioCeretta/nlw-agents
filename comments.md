● Code initialization

○ Search for 'ts-config bases' on google, go to the respective github repository and look for the code for our respective
programming language/version (e.g. @tsconfig/node22) and copy + paste the tsconfig.json
■ Add "noEmit" as true, this means that we want to use ts only for type checking and not for build bundling
■ Build is basically converting our app from ts to js, but since node 20 it already has native support to ts and there is
no need to create the build of our app
■ Add allowExportingTsExtensions as true

○ In package.json, add `"type": "module"` which will allow us to import using ECMAScript modules and not commonjs that is
the most common pattern inside node

○ Install fastify, @fastify/cors, fastify-type-provider-zod, zod

● Fastify Initialization
○ Create a src folder and a server.ts file inside of it, in server.ts, start the app with app = fastify() and at the first
line after fastify() invocation, register fastifyCors and on the second parameter, an object with the available origins
■ Set the serializerCompiler from the connection to the one imported from fastify-provider-zod
■ Same thing for the validatorCompiler
■ After configurations, add app.listen({ port }).then(() => { console.log("HTTP Server Running")})

● Code explanations

○ On package.json dev script. we need to add --experimental-strip-types between node src/server.ts, this flag tells Node.js
to strip the type annotations from the TypeScript code before running it. This is required, because it will enable execution
of TS files, allowing developers to run TS code without the need for a separate compilation step using tools like tsc
or Babel
■ However, when running we get the error 'fastify-type-provider-zod' does not provide an export named 'ZodTypeProvider'.
■ Import does not understand that ZodTypeProvider is a type, and when using this experimental strip, we need to specify
that we are importing just the type;
○ Also, the --watch flag is important because it will watch the application and reload in any changes
○ We also need to load the environment variables if we want to display them on compiling, for this, on our initialization
scripts we must add to it `--env-file .env`

● Import and Import Type

○ Use `import type` when you're only importing types, such as:
. interface
. type,
. Type aliases from libraries

    example would be

    ```ts
    import type { User } from './types';
    ```

    This keeps the type information at compile time only and remove it from the final JavaScript output, improving build
    performance and avoiding runtime overhead.

○ When to use regular import
Use standard import when you're importing anything that will exist at runtime, such as:
. Functions
. Classes
. Objects
. Constants
. Anything used directly in the code during execution

      Example:

      ```ts
      import { getUser } from './services';
      ```

○ Mixing Usage:

    If a module exports both types and runtime values, and you need both, you must use a regular import, even if you're
    also using types, except when using --experimental-strip-types for dev runtime

    ```ts

    import { User, getUser } from './module';

    ```

● Env configuration

○ For env configuration, is also a good approach, to always validate its data, and parse them
■ Which means ensuring that our application only execute if we have the required env variables, and we'll do it using
zod
■ With this, we are able to parse the env data and type, and use it across files.

● Biome Configuration

○ npm i @biomejs/biome -D
○ npx ultracite init — brings a pre established biome configuration to us
○ biome configurations will cover multiple aspects such as import order, bad habits, etc
○ If we don't like any rule, we simply go on its json, add a new "languageWeWant" attribute and change its rule
■ e.g. "javascript": { "formatter": { "semicolons": "asNeeded" }}

● Docker Configuration

○ For this, we will use docker, since it allow us to separately run services on our machine (in this case, the db)

■ Let's think we have more than ten applications, and each one of them uses a PostgreSQL db. However, it is very common
that one app may use one version of `Postgre` of specific extensions and the other use another one with other extensions
and is not a good practice to have just one Postgre installed shared across all applications, because one change in one
db ends up "reflecting" on other application's DBs.

■ Docker idea, on development environment, is isolating the applications, where one app declares which dependencies it
has, and each one of them are exclusive to that application.

■ Docker is also widely used in production environments

■ For the Docker configuration we are going to use the pgvector Docker image because it already includes support for the pgvector extension, which is
used for similarity search. the container will be

`nlw-agents-pg:
    image: pgvector/pgvector:pg17
    environment:
      POSTGRES_USER: docker
      POSTGRES_PASSWORD: docker
      POSTGRES_DB: agents
    ports:
      - 5432:5432 # Where the first ip is our machine, and the second one is the ip on docker
    volumes:
      - ./docker/setup.sql:/docker-entrypoint-initdb.d/setup.sql
`

□ This setup sql will consist of a CREATE EXTENSION if NOT EXISTS vector; which is used to enable the vector extension
inside of PostgreSQL in case it is not active. the vector extension was created to add support to big dimension vectors
(numerical arrays) inside Postgre — essential in AI applications, machine learning, and vector search, like the ones used
with OpenAI or HuggingFace embeddings

□ Docker Volumes Explanation: That docker compose line means that we are mounting a volume that: retrieves a file from
the host and put it inside the container on the given path

    In practice, if we are using a db container, such as pg, this directory `/docker-entrypoint-initdb.d` is special, every

.sql, .sh or sql.gz put in that path, will be automatically executed when the container is launched

■ AI Vector Similarity Explanation
This is a concept commonly used in AI, where we might store text in our database—such as a
blog post written in our own words. If a user searches our blog using words that are similar in meaning to those used in
the post, this type of search won’t rely on exact keyword matching, but rather on semantic meaning.

To enable this, we use vectors, which are numerical representations of the meaning of words—commonly referred to as
embeddings. These vectors are generated by algorithms that convert textual data into a semantic space.

For example, if our database contains the word "Dog", it will be represented as a vector, say [0.8, 0.2, 0.1]. The values
in this vector encode aspects of its meaning—for instance, indicating that it is a type of animal. If we have another entry
with the word "Cat", it will be represented by a different vector, but still close in meaning due to their semantic similarity.
So, if a user searches for "Doggo", the system will find that its vector is very close to that of "Dog", and return relevant
results based on that similarity.

Each number on this vectors represent a specific characteristic of the given word, and as much parameters we have, more
"entries"/"values" within this vector, more we are able to calculate the similarity (e.g dog => [1, 2], cat => [1, 3]).

But if someone types in "Happy Dog", since we don't have any parameter to identify the "Happy", it will only make use of
the Dog word

● DB Connection

○ DB Configuration for the .env, which will be something like `DATABASE_URL="postgresql://docker:docker@localhost:5432/agents"`
where database://user:password@host:docker_port/dbname

○ On the env.ts, add the DATABASE_URL for the env.object

○ Install postgres on npm

○ Create a src/db/connection.ts and inside of the file:

1. Import postgres from 'postgres'

2. export const client = postgres(env.DATABASE_URL)

3. Inside the db folder, create a schema and a migrations folder
   . schema will have all the db tables
   . room table: rooms refer to spaces or environments where users can interact with the AI. the "questions" that are going
   to be made, are prompts or messages that we will send to the AI, similar to how people interact with ChatGPT.

● Drizzle ORM
. Instead of prisma ORM, this project will use drizzle, they are both very popular, what the instructor likes about it
is that it has a similar syntax to SQL, and different from prisma, when using drizzle we still continue using sql

○ npm install drizzle-orm and drizzle-kit -D, which is the cli for table creations, migrations, etc.
○ When creating the tables, the only thing we need to be cautious is the import, it must always be from 'drizzle-orm/pg-core`○ Create an index.ts where we'll create a schema with all the tables within the`schema`folder, export it, export it,
and use it on connection.sql creation
○ After finishing config, run`npx drizzle-kit generate` on terminal and create a file in the outDir specified, with the
executed SQL, which we will then execute the npx drizzle-kit migrate to run this sql
○ Finally, execute npx drizzle-kit studio to visualize the database on a browser

○ Install drizzle-seed for creating database seeds.
■ When Seeding we usually reset the database before seeding, and drizzle-seed offers us functions to seed and reset.
■ Add script in package.json to run it

● Routes
○ Create a src/http/routes/ folder and inside of it, create all the endpoints we want to be accessed via rest application
○ Import FastifyPluginCallbackZod to type routes (e.g. getRoomsRoute). This function receives the `app` instance, register
the endpoint, and defines a callback that returns the desired response.
○ We now need to register, inside app in our server.ts, the app the routes we create
