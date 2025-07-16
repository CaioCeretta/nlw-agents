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
○ When creating the tables, the only thing we need to be cautious is the import, it must always be from 'drizzle-orm/pg-core
○ Create an index.ts where we'll create a schema with all the tables within the schema`folder, export it, export it,
and use it on connection.sql creation

○ After finishing config, run`npx drizzle-kit generate` on terminal and create a file in the outDir specified, with the
executed SQL, which we will then execute the npx drizzle-kit migrate to run this sql
○ Drizzle-kit generate x Drizzle-kit migrate x Drizzle-kit push
■ Drizzle-kit generate
□ Generates the .sql migration based on the current schema
■ Drizzle-kit migrate
□ Execute the migrations .sql in the database (and updates the db)
■ Drizzle-kit push
□ Directly applies the schema on the database, without generating a .sql

○ When a table has a relationship with other table (via foreign key), when creating our seeds, we can make use of a
property named `with`, and choose the given table

○ Table insert

    ■ Table insertions in Drizzle:

      1. We define a route, such as a `POST` for the `/rooms` endpoint  (First Parameter)
      2.
      3. The second parameter is the schema object that we want to modify. This will receive a body object containing the
     data we wish to add, such as name and description — the schema parameter that wraps the body has nothing to do with
     drizzle, but is part of `Fastify`'s configuration route with support to the plugin `fastify-type-provider-zod`, which
     allows us to
      . Automatically validate request.body with zod
      . Infer request.body types with type safety in ts
      . Integrate with plugins such @fastify/swagger to generate documentation

      . Therefore, schema is a known key to fastify as the validation route schema and body defines the request.body

      4. The third parameter is the function that will be triggered when the endpoint is accessed. This function receives
      two parameters:  the request data and the reply object
      5. In the `request.body`, you will find the parameters passed in the body from the previous step (thanks to zod).
      These parameters
        are then used in a db.insertion operation within the `rooms` table, which is part of the schema.
      6. Finally, after the insert, we call returning() to specify which columns we want to return from the db(), and
        by retrieving the id just inserted, we are able to send it to the client (returning() with no arguments returns
        every inserted column)

      7. We may end up with the "Unsupported Media Type", to fix this, we usually have to inform which type of data we are going
      to accept and the content type

○ Finally, execute npx drizzle-kit studio to visualize the database on a browser

○ Install drizzle-seed for creating database seeds.
■ When Seeding we usually reset the database before seeding, and drizzle-seed offers us functions to seed and reset.
■ Add script in package.json to run it

● Routes
○ Create a src/http/routes/ folder and inside of it, create all the endpoints we want to be accessed via rest application
○ Import FastifyPluginCallbackZod to type routes (e.g. getRoomsRoute). This function receives the `app` instance, register
the endpoint, and defines a callback that returns the desired response.
○ We now need to register, inside app in our server.ts, the app the routes we
○ By naming a route with # @name anyName, we are able to able to utilize its return inside other queries, like the id of
a room created (e.g. @roomId = {{createRoom.response.body.$.roomId}})
■ with arrays we use the key after the $.

○ Get Routes with params (for example ¨/rooms/:roomId/question¨)

■ The first parameter is the end point
■ the second parameter is the schema object, and the roomId as the parameter
■ The third parameter we can get the roomId from the previous step in the request object (thanks to zod)
and use it to fetch the specific room in the database.

● SQL Comments:

○ SQL left join:

    ```ts
    export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
      app.get("/rooms", async () => {
        const results = await db
          .select({
            id: schema.rooms.id,
            name: schema.rooms.name,
            createdAt: schema.rooms.createdAt,
            questionsCount: count(schema.questions.id),
          })
          .from(schema.rooms)
          .leftJoin(schema.questions, eq(schema.questions.roomId, schema.rooms.id))
          .groupBy(schema.rooms.id)
          .orderBy(schema.rooms.createdAt);

        return results;
    });
    ```

Using this query as an example

■ What we want?
□ Fetch all rooms from the rooms table
□ Along with it, to know how many `questions` (from question table), each room has
□ Even if a room does not have any question, it should still appear in the result
□ That's why we use LEFT JOIN instead of INNER JOIN

■ Table Structure

□ Simplified Table Structure Example

rooms
id: 1 | name: room 1 | createdAt: 2024-07-01 10:00
id: 2 | name: room 2 | createdAt: 2024-07-01 11:00
id: 3 | name: room 3 | createdAt: 2024-07-01 12:00

---

questions

id: 1 | question: What is react? | answer: null | roomId: 1
id: 2 | question: What is SQL? | answer: null | roomId: 1
id: 3 | question: What is JSON? | answer: null | roomId: 2

. Room with the id 3 does't have any question

■ What does this snippet do

□ select(): defines which fields we want in the result
□ from(schema.rooms): starts by fetching the rooms
□ leftJoin(...): joins with the `questions` table, if present. if not, it will set null
□ count(schema.questions.id): Counts how many questions there are per room (even if it's 0)
□ groupBy(schema.rooms.id): Groups the results by room, to count correctly
□ orderBy(schema.rooms.createdAt): Orders it by room date creation

● Gemini service

○ Gemini API

    ■ For the Gemini code we are going to create a service on src/services/gemini.ts
    ■ First of all, we need to install gemini sdk — `@google/genai`
    ■ Import GoogleGenAi from this library and create a new object, passing as argument the apiKey which can be created
    by going to `aistudio.google.com` and creating one

● Upload File Route

○ This will be a post route with the roomId as a param, and its body won't have a type since it won't receive a JSON, but
a file

○ To use a file inside Fastify, we need to install the library `@fastify/multipart` which is the plugin that enables
fastify to understand requests that are sending multipart in its body

○ The route function will assign request.file to a constant named audio, check its existence, and start treating it

■ First, we need to check if the audio exists, because it can be multipart.multipartfile or undefined

■ Now we have to transcribe the audio using Gemini and generate the semantic vector (embeddings). Lastly we are going
to store the vectors inside the database

○ Audio Chunks table

■ Audio chunks are audio pieces, right now we are just sending the raw audio as a blob, but we are soon going to send
these audios separate on intervals.

■ For storing these files, we are going to create a new table named audio chunks

    □ This table will consist of:

      1. id
      2. roomId, which references the id of the room
      3. transcription - audio transcription,
      4. embeddings - semantic representation, and since we are using pgvector that has support to vectors, the embeddings
      typing is going to be a vector
        4.1. This vector need to have a dimension quantity, which the most common are 768 dimensions, and the more dimensions
        we have, the more accurate is going to be the proximity.
        4.2. 768 dimensions mean that this vector have 768 numbers inside of it, and each number represent a characteristic
        of the given piece of code. Therefore, we are going to be able to compare vectors in a way we can get each of these
        numbers and see which is similar to which, in other words, a semantic search, not one by text, but by meaning.
      5. finally a createdAt as the last column
