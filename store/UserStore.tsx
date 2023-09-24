import { account, databases } from "@/appwrite";
import getUrl from "@/lib/getUrl";
import uploadImage from "@/lib/uploadImage";
import { AppwriteException, ID, Models, Query } from "appwrite";
import { create } from "zustand";

interface UserState {
  user: any;
  userAvatar: string | null;
  setUser: (user: any) => void;
  register: (
    email: string,
    password: string,
    name: string,
    image: File | null
  ) => Promise<Models.User<Models.Preferences>>;
  logIn: (email: string, password: string) => Promise<string | Models.Session>;
  getUserData: () => Promise<Models.User<Models.Preferences>>;
  getAvatar: (userId: string) => void;
  logout: () => Promise<{}>;
}

export const useUserStore = create<UserState>()((set) => ({
  user: {},
  userAvatar: null,
  setUser: (user: any) => set({ user }),

  getUserData: async () => {
    try {
      const data = await account.get();
      set({ user: data });
      return data;
    } catch (error) {
      const appwriteError = error as AppwriteException;
      throw new Error(appwriteError.message);
    }
  },

  getAvatar: async (userId: string) => {
    const data = await databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!
    );
    if (data.total === 0) return;
    const avatar = data?.documents;
    if (avatar[0]?.image) {
      const imageDetail = JSON.parse(avatar[0]?.image);
      const imageUrl = await getUrl(imageDetail && imageDetail);
      set({ userAvatar: imageUrl.toString() });
    } else {
      set({ userAvatar: "" });
    }
  },

  register: async (
    email: string,
    password: string,
    name: string,
    image?: File | null
  ) => {
    let file: Image | undefined;
    try {
      if (image) {
        const fileUploaded = await uploadImage(image, "user");
        if (fileUploaded) {
          file = {
            bucketId: fileUploaded.bucketId,
            fileId: fileUploaded.$id,
          };
        }
      }
      const result = await account.create("unique()", email, password, name);
      if (file) {
        const data = await databases.createDocument(
          process.env.NEXT_PUBLIC_DATABASE_ID!,

          process.env.NEXT_PUBLIC_IMAGE_COLLECTION_ID!,
          ID.unique(),
          {
            user: result.$id,
            imageUrl: JSON.stringify(file),
          }
        );
      }
      return result;
    } catch (error) {
      const appwriteError = error as AppwriteException;
      throw new Error(appwriteError.message);
    }
  },

  logIn: async (email: string, password: string) => {
    try {
      const result = await account.createEmailSession(email, password);
      return result;
    } catch (error) {
      const appwriteError = error as AppwriteException;
      throw new Error(appwriteError.message);
    }
  },

  logout: async () => {
    try {
      const result = account.deleteSession("current");
      set({ user: {} });
      set({ userAvatar: null });
      return result;
    } catch (error: unknown) {
      const appwriteError = error as AppwriteException;
      throw new Error(appwriteError.message);
    }
  },
}));
