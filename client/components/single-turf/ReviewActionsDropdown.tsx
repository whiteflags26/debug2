"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Flag } from "lucide-react";
import { useState } from "react";
import { ITurfReview, UpdateReviewData } from "@/types/turf-review";
import { IUser } from "@/types/user";
import ReviewForm from "./ReviewForm";
import toast from "react-hot-toast";
import { ApiError } from "@/types/api-error";

interface ReviewActionsDropdownProps {
  review: ITurfReview;
  currentUser: IUser | null;
  onDelete: () => Promise<void>;
  onEdit: (data: UpdateReviewData) => Promise<void>;
  onReload: () => void;
}

export default function ReviewActionsDropdown({
  review,
  currentUser,
  onDelete,
  onReload,
}: ReviewActionsDropdownProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isReviewOwner = currentUser?._id === review.user._id;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete();
      toast.success("Review deleted successfully");
      onReload();
    } catch (err) {
      const error = err as ApiError;
      toast.error("Failed to delete review. "+error.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  const handleReport = () => {
    toast.success("Thank you for reporting. We'll look into this.");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isReviewOwner ? (
            <>
              <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Review
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowDeleteAlert(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Review
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem onClick={handleReport}>
              <Flag className="mr-2 h-4 w-4" />
              Report Review
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your review will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <ReviewForm
            turfId={typeof review.turf === 'string' ? review.turf : review.turf._id}
            onSuccess={() => {
              setShowEditDialog(false);
              onReload();
            }}
            initialData={{
              reviewId: review._id,
              rating: review.rating,
              review: review.review || "",
              images: review.images || [],
            }}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}