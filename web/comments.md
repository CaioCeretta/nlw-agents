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

○ We make API requests in a react application through @tanstack/react-query, here's how it goes:

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
     

