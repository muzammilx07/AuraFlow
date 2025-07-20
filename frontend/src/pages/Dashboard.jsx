import { useState, useEffect, useRef } from "react";
import { Plus, Search, User, Pencil, Play, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stackName, setStackName] = useState("");
  const [stackDescription, setStackDescription] = useState("");
  const [stacks, setStacks] = useState([]);
  const hasMounted = useRef(false);

  // Load stacks from localStorage on mount
  useEffect(() => {
    const storedStacks = localStorage.getItem("stacks");
    if (storedStacks) {
      try {
        const parsed = JSON.parse(storedStacks);
        if (Array.isArray(parsed)) {
          setStacks(parsed);
          console.log("📦 Loaded stacks:", parsed);
        }
      } catch (err) {
        console.error("❌ Invalid JSON in localStorage:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (hasMounted.current) {
      localStorage.setItem("stacks", JSON.stringify(stacks));
    } else {
      hasMounted.current = true;
    }
  }, [stacks]);

  const handleCreateStack = (e) => {
    e.preventDefault();

    const newStack = {
      id: Date.now().toString(),
      name: stackName,
      description: stackDescription,
    };

    setStacks((prevStacks) => [...prevStacks, newStack]);
    setStackName("");
    setStackDescription("");
    setIsModalOpen(false);
  };

  const handleRunStack = (stackId) => {
    alert(`Running stack: ${stacks.find((s) => s.id === stackId)?.name}`);
  };

  const handleDeleteStack = (stackId) => {
    const updatedStacks = stacks.filter((stack) => stack.id !== stackId);
    setStacks(updatedStacks);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="text-base">WorkFlow No Code Automation</span>
        </Link>
        <div className="relative ml-auto flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search stacks..."
            className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[336px] h-9 text-sm"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full border w-7 h-7"
            >
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold md:text-2xl">Your Stacks</h1>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create New Stack
          </Button>
        </div>

        {stacks.length === 0 ? (
          <Card className="flex flex-1 items-center justify-center">
            <CardContent className="text-center text-muted-foreground">
              No stacks created yet. Click "Create New Stack" to get started!
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Existing Stacks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stacks.map((stack) => (
                    <TableRow key={stack.id}>
                      <TableCell>{stack.name}</TableCell>
                      <TableCell>{stack.description}</TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Link to={`/editor/${stack.id}`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRunStack(stack.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Run
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteStack(stack.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Stack</DialogTitle>
            <DialogDescription>
              Enter the name and description for your new stack.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStack}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stackName" className="text-right">
                  Name
                </Label>
                <Input
                  id="stackName"
                  value={stackName}
                  onChange={(e) => setStackName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="stackDescription" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="stackDescription"
                  value={stackDescription}
                  onChange={(e) => setStackDescription(e.target.value)}
                  className="col-span-3"
                  rows={4}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Stack</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
