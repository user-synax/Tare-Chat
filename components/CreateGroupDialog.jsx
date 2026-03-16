"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users } from "lucide-react";

export default function CreateGroupDialog({ friends, onCreate }) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);

  const handleCreate = () => {
    if (groupName && selectedMembers.length > 0) {
      onCreate(groupName, selectedMembers);
      setOpen(false);
      setGroupName("");
      setSelectedMembers([]);
    }
  };

  const handleMemberSelect = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Users className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Group Name
            </Label>
            <Input
              id="name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="col-span-3"
              placeholder="My Awesome Group"
            />
          </div>
          <div className="flex flex-col space-y-2 mt-4">
            <Label>Select Members</Label>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              {friends.map((friend) => (
                <div key={friend._id} className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id={`member-${friend._id}`}
                    checked={selectedMembers.includes(friend._id)}
                    onCheckedChange={() => handleMemberSelect(friend._id)}
                  />
                  <label
                    htmlFor={`member-${friend._id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {friend.username}
                  </label>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate}>Create Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
