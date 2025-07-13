● Instructor chose to rename the default App.tsx filename, to app.tsx

● If we intend to overrule biome and make it stop auto adding semi colons, we should:
○ Go to biome.jsonc and add a new parameter "javascript: { "formatter": { semicolons: "asNeeded" }}

● Properties x Attributes

. Reminder, what we have in the key value of an object is a property

○ Attributes

    ■ What they are: Data stored inside an object (its fields/state)

    ■ Used in
      □ OOP: An attribute refers to a variable that holds data inside a class or object

        ```java
          Public class Car {
            String color; // 'color' is an attribute

            public Car(String color) {
              this.color = color;
            }
          }
        ```

      □ HTML/DOM: In web development, attributes are key-value pairs inside HTML tags.

        ```html
        <input type="text" disabled>
        <!-- 'type' and 'disabled' are attributes -->

    In summary, we can think of an attribute as a named value associated with an object or element

○ Properties

■ Meaning: Properties are characteristics of objects, often combining attributes with logic, often refer to methods
such as getter and setter that give access to an attribute

■ Used in:

    OOP: A property is a special method (getter/setter) that controls access to an attribute

      ```java

        Class Person {
          private String name; // Private Attribute

          public String getName() {
            return name
          }
        }

● New TailwindCSS config

1. Install tailwindcss and @tailwindcss/vite ( in case you're using vite )
2. inside vite.config.ts, in the property plugins, add tailwind(), and inside index.css @import tailwindcss

● Coding

○ Add shadcn and add its dark class in index.html html tag

○ We make API get requests in a react application through @tanstack/react-query, here's how it goes:

   1. Create a react-query client, wrap the whole application inside a QueryClient, and use it on the client prop
   2. Tanstack useQuery: It is a function that has 2 required parameters
      . queryKey: an array containing a unique identifier for this http call, such as ['get-rooms']
      . queryFn: which function we are going to execute to bring API data
      . First of all, since we are doing an API Call, when we hover up the data json returned by the fetch call, ts won't
      know its format, so we create a type, with the answer we are going expect from this call, and type the fn data, which
      we will use
       type GetRoomsApiResponse = Array<{
         id: string
         name: string
       }>;
  3: When destructuring the useQuery call, we can obtain the data — returned data from the call, isLoading and isError
  4: To retrieve a param in a vite route, simply call useParams() from react-router-dom, ts will also not know which params
  we can receive, so we create a type for RoomParams, and simply say the name of the param we will receive and type
  useParam<RoomParam>. The id can still be undefined because the user can delete the param from the url, so is always
  a good approach to check if the param exist

○ React Query provides the useMutation hook to deal with operations that modify data, such as creating, updating, or
deleting resources. In this case, it's used to send form data to the backend when a user submits the room creation form.

  ■ Mutation definition

    □ The object passed to useMutation includes the following configuration:
 
      - mutationFn: An asynchronous function that runs when the mutation is triggered (e.g., on form submission).
      – This function receives data shaped as CreateRoomRequest, containing name and description.
      – Sends a POST request to http://localhost:3333/rooms with a JSON body.
      – Awaits the response from the API, which returns a JSON containing the roomId.
      – The result is typed as CreateRoomResponse.

  ■ Method Invocation

    □ After its implementation, we call it inside the form component where we want to implement it
    □ useCreateRoom will return us a function named useMutateAsync(), this is the function that will trigger our mutation
    function, which is the function that performs the http call. After assigning it to a constant, we rename it to a name
    related to its behavior on the code (such as createRoom)
    □ Now, we simply modify the function useForm that RHF uses to submit the form, for the mutation function

    □ The creation works, but the list on the right is not updated, why?

      . When the useRooms call to list all the rooms was made, we chose a queryKey for useQuery
      . We can use this id on a property named on useMutation's onSuccess parameter.
      . This parameter fn is triggered whenever the mutationFn returns a success
      . For it, we assign to a constant, the useQueryClient from react-query, and use this queryClient to invalidate the
      key used in the get-room queryKey inside that API Call
      . By invalidating a call, it will 'redo' the queries with that queryKey that are on screen




○ src/http folder 

  ■ One thing the instructor likes to do to keep the code organized, is to create a types folder inside http to share it
  across the application
  ■ Thus folder also includes the `useQuery`s used to fetch data from the API, where it works similar to a context, where
  we utilize the use keyword as prefix, such as useRooms for the function that retrieves the db data, where we are able
  to get all the tanstack responses — such as data, isLoading, isError

○ Shadcn Form

  ■ We are used to utilize the RHF (React Hook Form) by calling its function and assigning to constants the variables
  it contains, such as formState, Control, register, etc. However, shadcn, on the Form component, when using rhf, since
  it receives the full form component, we must not destructure it, instead we must assign the result of the useForm to a
  constant and spread it on the <Form {...constantNameChosenForTheForm}>... and within the Form, we use the regular HTML
  form. which would require, on the submit action something like `onSubmit={createRoomForm.handleSubmit(handleCreateRoom)}`

  TL;DR - We assign useForm return to a constant and spread it as prop to the shadcn Form

  ● FormField — Assigning Form Fields in shadcn/ui

  ○ Required properties for FormField

    ■ control  
      – Passed from useForm()  
      – Connects the field to the form’s state  

    ■ name  
      – Must match the key in your Zod schema  
      – Example: `name="name"` or `name="description"`

    ■ render({ field })  
      – Receives the field object  
      – You usually spread ...field into the input

      – What does `field` contain?  
        • value: the current input value  
        • onChange: updates the form state  
        • onBlur: tracks focus loss  
        • ref: React ref for accessibility

      – shadcn/ui components used:
        • FormItem — wraps field, label, and message  
        • FormLabel — provides the label  
        • FormControl — wraps the input  
        • FormMessage — shows validation error

○ Get Room Questions useQuery

  ■ Unlike getRooms, the questions are dynamic and depend on the current room. When the room changes, the query must change
  as well. Therefore, using the same `queryKey` identifier for all of them would cause issues. 
  ■ Since `reactQuery` has a caching system that runs on memory, it means that if we access a room and fetch the questions
  made on that room and then accessing other room, and executing the same query again and both of them having the same ID,
  it will end up showing the questions fetched at the first room, in the second one, because since they have the same ID,
  the answer is going to be cached.
  ■ When there is a parameter (or more than one), where want to list the questions, as the queryFn second argument, we
  also include the parameter into the queryKey value, e.g  `queryKey: ['get-questions', roomId]`. Now id is going to be
  different for each room


○ Question List Component

  ■ Question list component holds all the questions inside a specific room
  ■ We created the query to get the room questions on the previous step. The data returned by useQuery is going to be
  assigned to a constant on that new file where we'll iterate over them, creating a question item for each one. Such
  as `const { data } = useRoomQuestions(roomId);`


○ Create Questions

    ◆ Reminder  About typings:
      . Always look forward to typing requests, responses, any typing. It will help us a lot when coding to know exactly
      what the return and the response are going to be.
  ■ Within the http folder we are going to have the types of requests and responses — responses are mainly typed after
  the server API return. 
  ■ We then create the mutation to send the function to the API endpoint, pretty much as the other one.

○ Invalidating Query Keys

  ■ We have previously seen that when a query key is invalidated, such as in an onSuccess, the queryFn is going to be remade.

  ■ However, when mutating, we need to be careful because: 

    □ By going into the use-rooms-questions, that is a request, we can notice that we have the roomId inside the query
    key array
    □ Different from the rooms key, where we invalidate the rooms fetch to fetch the new list, we now have a parameter
    □ We receive the roomId as parameter, but is only available on the mutation function, it is not visible within the
    onSuccess context  

    One approach we can take to fix this: 

    □ Before, the CreateQuestionRequest type includes the question and roomId as properties.

    □ After in the CreateQuestionRequest type, instead of defining the roomId as part of the type, we specify that the question
    will be included and the roomId will be passed as a parameter to useCreateQuestion function

    □ By using this approach, roomId is going to be available throughout the entire function, making it accessible for use
    inside revalidate

    □ However, different from the other functions, this will involve us passing the room id when invoking that mutationFn
    e.g `const { mutateAsync } = useCreateQuestion(roomId)` 

    □ mutateAsync is not being directly exported anywhere. It is a property returned by the hook useCreateQuestion, which
    internally, encapsulate the useMutation
    

