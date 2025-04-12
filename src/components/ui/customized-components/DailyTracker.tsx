"use client";
import { useState, useEffect } from "react";
import { Store, MapPin, CheckCircle, CalendarClock } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useActions, useUIState } from "ai/rsc";
import type { AI } from "@/app/ai";
import { useChatId } from "@/context/ChatIdProvider";
import pb from "@/lib/pocketbase";

// Replace with your PocketBase URL

interface Task {
  id: string;
  status: "start" | "completed";
  expand?: {
    outlet_id?: { id: string; name: string ;address:string};
    activities?: { id: string; name: string }[];
  };
}

export default function OutletVisits() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [conversation, setConversation] = useUIState<typeof AI>();
  const { continueConversation } = useActions();
  const { chatId } = useChatId();

  useEffect(() => {
    async function fetchTasks() {
      try {
        // Fetch tasks with expanded outlet and activities
        const response = await pb.collection("Tasks_Data").getFullList({
          expand: "outlet_id,activities",
        });

        console.log("This is task tracker response:", response);

        // Convert response to match Task[] type
        const formattedTasks: Task[] = response.map((task) => ({
          id: task.id,
          status: task.status || "start", // Default to "start" if undefined
          expand: {
            outlet_id: task.expand?.outlet_id
              ? {
                  id: task.expand.outlet_id.id,
                  name: task.expand.outlet_id.name,
                  address:task.expand?.outlet_id?.address,
                }
              : undefined,
            activities: task.expand?.activities?.map((act: any) => ({
              id: act.id,
              name: act.name,
            })) || [],
          },
        }));

        setTasks(formattedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    }

    fetchTasks();
  }, []);




  const handleSubmit = async (taskId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setConversation((currentConversation: any) => [
      ...currentConversation,
      {
        id: Date.now().toString(),
        display: <div>{`Starting visit for task ${taskId}`}</div>,
        role: "user",
      },
    ]);

    const ui = await continueConversation(`Start visit for task ${taskId}`, chatId);
    setConversation((currentConversation: any) => [...currentConversation, ui]);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-full">
                <Store className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Daily Outlet Visits</CardTitle>
            </div>
            <Badge
              variant="outline"
              className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 flex items-center self-start sm:self-auto"
            >
              <CalendarClock className="h-4 w-4 mr-2" />
              Today's Schedule
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
              {tasks.map((task) => (
                <Card
                  key={task.id}
                  className="overflow-hidden border-2 hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">
                          Outlet: {task.expand?.outlet_id?.name || "Unknown"}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-1" />
                         Address: {task.expand?.outlet_id?.address}
                        </div>
                      </div>
                    </div>
                    {/* Activity Dropdown */}
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {task.expand?.activities?.length ? (
                          task.expand.activities.map((activity) => (
                            <SelectItem key={activity.id} value={activity.id}>
                              {activity.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none">No activities found</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-4 border-t bg-muted/20">
                    {task.status === "completed" ? (
                      <Button
                        variant="outline"
                        className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </Button>
                    ) : (
                      <Button onClick={() => handleSubmit(task.id)} variant="default" size="sm" className="hover:bg-primary/90">
                        Start Visit
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
 