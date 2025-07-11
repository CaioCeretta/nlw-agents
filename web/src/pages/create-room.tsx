import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type GetRoomsAPIResponse = Array<{
  id: string;
  name: string;
  questionsCount: number;
  createdAt: string;
}>;

export function CreateRoom() {
  const { data, isLoading } = useQuery({
    queryKey: ["get-rooms"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3333/rooms");
      const result: GetRoomsAPIResponse = await response.json();

      return result;
    },
  });

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="grid grid-cols-2 items-start gap-8">
          <div />

          <Card>
            <CardHeader>
              <CardTitle>Recent Rooms</CardTitle>
              <CardDescription>
                Quick Access to the recently created rooms
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {data?.map((room) => {
                return (
                  <div
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
                    key={room.id}
                  >
                    <div>
                      <h3 className="font-medium">{room.name}</h3>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
