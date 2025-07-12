import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { useCreateRoom } from "@/http/use-create-room";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

const createRoomSchema = z.object({
  name: z.string().min(3, "Enter at least 3 characters."),
  description: z.string(),
});

type CreateRoomFormType = z.infer<typeof createRoomSchema>;

export function CreateRoomForm() {
  const { mutateAsync: createRoom } = useCreateRoom();

  const createRoomForm = useForm<CreateRoomFormType>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  async function handleCreateRoom({ name, description }: CreateRoomFormType) {
    await createRoom({ name, description });
    await createRoomForm.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Room</CardTitle>
        <CardDescription>
          Create a new room to begin asking questions and receive answers from
          the AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...createRoomForm}>
          <form
            className="flex flex-col gap-4"
            onSubmit={createRoomForm.handleSubmit(handleCreateRoom)}
          >
            <FormField
              control={createRoomForm.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Room Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter the room name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              control={createRoomForm.control}
              name="description"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Room Description</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Enter the room description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <Button className="w-full" type="submit">
              Create Room
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
