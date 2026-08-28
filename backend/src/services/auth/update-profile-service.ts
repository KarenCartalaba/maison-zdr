import { AuthRepository } from "@/repositories/auth.repository";
import { uploadImage, deleteImage, extractPublicId } from "@/lib/cloudinary";
import { cacheInvalidate } from "@/lib/redis";

const authRepo = new AuthRepository();

const USER_BY_ID = (id: string) => `user:${id}`;

export async function UpdateProfileService(
  userId: string,
  data: { name?: string; email?: string; phone?: string },
  imageBase64?: string
) {
  try {
    const user = await authRepo.findUserById(userId);
    if (!user) {
      return { code: 404, status: "error", message: "User not found" };
    }

    const updateData: any = { ...data };

    // If new profile pic is provided, upload to Cloudinary and delete old one
    if (imageBase64) {
      // Delete old profile pic if it exists
      const currentProfilePic = (user as any).profilePic;
      if (currentProfilePic) {
        const oldPublicId = extractPublicId(currentProfilePic);
        if (oldPublicId) {
          await deleteImage(oldPublicId).catch(console.error);
        }
      }

      // Upload new pic
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const result = await uploadImage(buffer, "maison-zdr/profiles", `profile-${userId}`);
      updateData.profilePic = result.url;
    }

    // Check email uniqueness if changing
    if (data.email && data.email !== user.email) {
      const existing = await authRepo.findUserByEmail(data.email);
      if (existing) {
        return { code: 409, status: "error", message: "Email already in use" };
      }
    }

    const updated = await authRepo.updateUserProfile(userId, updateData);

    // Invalidate user cache
    await cacheInvalidate(USER_BY_ID(userId));

    return {
      code: 200,
      status: "success",
      message: "Profile updated successfully",
      data: {
        user: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          emailVerified: updated.emailVerified,
          profilePic: (updated as any).profilePic,
        },
      },
    };
  } catch (error) {
    console.error("UpdateProfileService error", error);
    return { code: 500, status: "error", message: "Unable to update profile" };
  }
}
