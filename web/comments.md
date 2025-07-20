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
        ```

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
      ```

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
  ■ This folder also includes the `useQuery`s used to fetch data from the API, where it works similar to a context, where
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



● Recording Audio and Creating Questions

  ○ Create Questions

    ◆ Reminder  About typings:
      . Always look forward to typing requests, responses, any typing. It will help us a lot when coding to know exactly
      what the return and the response are going to be.
  ■ Within the http folder we are going to have the types of requests and responses — responses are mainly typed after
  the server API return. 
  ■ We then create the mutation to send the function to the API endpoint, pretty much as the other one.

  ○ create-room-audio.tsx
    ■ Unlike getRooms, the questions are dynamic and depend on the current room. When the room changes, the query must change
    as well. Therefore, using the same `queryKey` identifier for all of them would cause issues. 
    ■ Since `reactQuery` has a caching system that runs on memory, it means that if we access a room and fetch the questions
    made on that room and then accessing other room, and executing the same query again and both of them having the same ID,
    it will end up showing the questions fetched at the first room, in the second one, because since they have the same ID,
    the answer is going to be cached.
    ■ When there is a parameter (or more than one), where want to list the questions, as the queryFn second argument, we
    also include the parameter into the queryKey value, e.g  `queryKey: ['get-questions', roomId]`. Now id is going to be
    different for each room

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

  ○ Question List / Question Item Components

    ■ Question List

      □ Question list will make use of the useRoomQuestions query we have just created. assign to a variable data and
      iterate over each one and assign the question to a `<QuestionItem>`

      □ In the question parameter, we don't have to send only the specific question attribute, we can pass the whole object
      since its type is of the expected return

    ■ Question Form

      □ We will create a new function under http, named useCreateQuestion.ts where it will create the room on form submit
      and redo the query to the rooms as soon as it succeeds
 
● Recording and Saving audios

  ■ First of all, we need to make sure that the browser can record audio

  ■ Next, we'll set a state variable (for example, isRecording) to true to indicate that recording has started. This can
  be useful for managing UI elements, like showing a "Stop Recording" button.

  ■ We are going to monitor the audios being recorded in the AudioRecorder page through dev tools network tab

  𥨐 Inside this component, we are going to check if the browser has all the specific permissions, like:
    □ const isRecordingSupported = !!  navigator.mediaDevices
      && typeof navigator.mediaDevices.getUserMedia === 'function';
      && typeof window.MediaRecorder === 'function'

    □ But we'll notice that MediaRecorder will give us an error: `Property 'MediaRecorder' does not exist on type
    'Navigator'.ts(2339)`

    □ To fix the error above, we need to add @types/dom-speech-recognition for typescript to understand that this MediaRecorder
    exists in the browser

  ○ Start Recording

    □ We use the recorder  start recording. Recorder is a object of the type MediaRecorder

    □ Recording Audio in the Browser: Step-by-Step Guide

    1. Check for Browser Compatibility
  
      - First, ensure the browser supports recording audio using the MediaRecorder API, which we have already done. The
      browser must have access to the user's microphone, so we will check if navigator.mediaDevices.getUserMedia is available.

    2. Request Microphone Access
  
    - We use the navigator.mediaDevices.getUserMedia method to request access to the user's microphone. This returns a
    promise that, if resolved, provides a MediaStream object, which contains the audio track from the microphone.

    - This step is crucial because the getUserMedia method allows us to set options like:

      . echoCancellation: Helps reduce the echo in the recording.

      . noiseSuppression: Filters out background noise for clearer audio.

      . sampleRate: Defines the frequency of audio samples. A common value is 44100 Hz (the standard for CDs).

    - These settings can be passed when getting the microphone stream, ensuring better quality audio capture.

    3. Create a MediaRecorder Instance
  
      - Once we have the audio stream from the microphone, we create a MediaRecorder instance. The constructor of the
      MediaRecorder takes in:

      . The audio stream (MediaStream object).

      . MIME type: A format for recording (e.g., audio/webm or audio/ogg). Different formats affect the file size, quality,
      and compression.

      . Audio bitrate: The audio quality and size. A common value for recording is 64,000 bits per second (64kbps),
      but this can vary based on the desired quality.

      - MediaRecorder will handle the encoding and recording of the audio.

      4. Handle the Recording Data

        - The MediaRecorder API provides an event, ondataavailable, which is fired whenever data (audio) is available
      during the recording process. Inside this event handler, we check if event.data.size > 0 to make sure there's
      actually audio data to save.

    5. Start and Stop Recording
  
      - You can use the onstart and onstop events of the MediaRecorder to track when the recording starts and stops. This 
      can be useful for updating UI elements like showing a progress bar, changing the button to "Stop", etc.

        . onstart: Triggered when the recording starts.

        . onstop: Triggered when the recording stops.

    6. Save the Audio
      - After the recording is stopped, the audio data can be processed (e.g., saved to a file, uploaded to a server, or converted
    to a different format). This is done by capturing the data chunks from the ondataavailable event.

      7. Start Recording
  
      - At the end of file, call recorder.start() to begin the recording

○ Stop Recording

  ■ On every recording, for it to finish and be persisted, we need to stop it

  ■ We are going to create the stopRecording function, however, we will not be able to call the recorder.stop() function,
  since the function that stops is not the same as the one we create the MediaRecorder instance and we don't have direct
  access to this same recorder

  ■ We can't use a state to the store the recorder since a state is used for storing variables that when their values
  change, they re-render the component. isRecording have a state because there is a conditional for showing different
  texts depending on that variable value. If it was a normal variable, not a state, the interface wouldn't be recreated
  when the value change, and we wouldn't be able to show different button values when the value change.

  ■ Recorder, on other hand, we want to store it in a variable that we don't need to keep watching its value, but we
  also can't create it as a traditional variable, such as a const or let because when the state changes, everything
  that is inside the component, would go back to its initial state, and we would lose the reference to this recorder.
  Because of this, when we want to keep a reference for a variable, a hook called useRef

○ useRef use explanation 

  ■ What is useRef?
  useRef is a hook that comes from the `react` library. It provides a way to persist values across renders without causing
  re-render when updated it. It returns a mutable object with a `.current` property that can hold any value, such as DOM
  elements or variables. Commonly, `useRef` is used to directly reference DOM elements or to store values that should not
  trigger re-renders, like previous state values or timers. It is often preferred over useState for cases where a value
  needs to persist between renders but doesn't need tto trigger a UI update.

  ■ How will it help our recorder code?

    □ We start by assigning this ref to a recorder constant, and this ref is of type <MediaRecorder | null>
    
    □ We change the whole start recording to utilize this recorders to this recorder.current

    □ On the onStop we check if there is a recorder.current and its state is inactive, then we stop it.

    □ If know we try to record an audio, on the console.log it will now give us the returned audio blob

○ Converting the blob to a file and send it to our API

  ■ Send this file to the api

    □ To send this file to the API, we have o make an api call for our API after we stop the recording

    □ We are going to create a new uploadAudio function to handle this. As soon as the audio data is available we are going
    to send the audio, via the start recording function as an argument to this new function

  ○ Create Audio Function

    ■  When we have to send files to the backend, we can't do it via JSON, it doesn't support JSONs, unless we convert it
    to base64, but the problem with this is that it increases the file size being sent in 10 or 20 percent, which is not
    desired

    ■ Usually, every time we need to transfer files between the front and the backend, we prefer to use FormData — which is
    the `application/multipart-formdata`
      . For this, we are going to declare a `formData` constant and assign a new instance of the FormData class to it.

    ■ We are going to append `("file", audio, "audio.webm")` to the new formData constant, where the first argument is
    the type, second one is the blob (audio), and the third parameter the name and extension

    ■ Send the request to the api, passing the method as POST and the body as the formData, e.g.

    ```ts
      await fetch(
        `http://localhost:3333/rooms/${params.roomId}/audio`,
        {
          method: "POST",
          body: formData,
        }
      );
    ```

    ■ What will this route do?

      □ Transcribe the audio using the Gemini API
      □ Convert the audio to semantic representation using an embeddings algorithm and persist it on the db
  
  ● Final touches

    ○ When creating a question via form, the answer isn't shown on the screen

      ■ Whenever we make a question and send, it shows the question and the answer is a spinning circle and the text of
      waiting AI to generate the answer

        □ To fix this, inside the question form, we assign a isSubmitting check from RHF, and disable all inputs and buttons
      while it is still submitting

        □ However, we want that, as soon as the answer is generated, for it to show the answer

      ■ Instead of invalidating that query onSuccess, as we are doing, we change the strategy

        □ onMutate

        . Within useCreateQuestion, we are going to add a new onMutate before onSuccess, onMutate executes on the moment
        the API call is being made (i.e. in the moment we create to generate a new question, this will call the useCreateQuestion
        function and the onMutate starts running)

        . When calling onMutate, we receive on the parameters, the data of the implementation, therefore, the question been
        created by the user 

        . We assigned to queryClient the result of the useQueryClient() hook, that holds the query cache of our whole application,
          and the queryClient have access to the setQueryData property
          - This property allows us to update the value of another query, an information that already came previously to\
          the api, with a new value.
          - When the user click on `send question` button, we want to add it within the listing, even if it hasn't already
          been sent and saved on the database. This is called optimal interface.
          - Optimal interface is about showing to the user that his information was registered and is being processed, even
          if it still hadn't happen. In case an error occurs, we rollback.
          
        . We assign to a questions constant the result of queryClient.queryData(key), where the key is from a query that
          has been made and we want to retrieve the cached value, on this case 
          queryClient.getQueryData(['get-questions'], roomId) and now we have access to all fetched questions

        . We must type the `questions` the same way we type the response on the useQuery for ts to know what this questions
          hold

        . Using `setQueryData` we are going to update the value of this cached query, in the first parameter, we use the
        same array as we used as the queryKey, and as the second parameter we pass an array, with the purpose of the new
        created question being inserted at the top of the list. This will require the second parameter to be an array with
        the following:

        - First, we check if there are questions on the cached questions array.
        
          - This is done by const questionsArray = questions ?? []; < It will assign questions if it exists, otherwise, an empty array

          - Then, on the setQueryData, it will simply be an array with the first index being an object with the new value and
        as the second one, the questionsArray. 







      



    


      



 


    

    









  

  

    


  

