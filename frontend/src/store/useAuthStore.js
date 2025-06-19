import {create} from "zustand"
import {axiosInstance} from '../lib/axios.js'
import toast from "react-hot-toast";
import {io} from "socket.io-client"

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : window.location.origin;

export const useAuthStore = create((set,get)=>({
    authUser:null,
    isSigningUp:false,
    isLoggingIng:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,
    onlineUsers: [],
    socket:null,

    checkAuth:async()=>{
        try {
            const res =await axiosInstance.get("/auth/check")
            set({authUser:res.data})
            get().connectSocket();
        } catch (error) {
            console.log("error in check auth",error)
            set({authUser:null})
        } finally{
            set({isCheckingAuth:false})
        }
    },
    signup:async(data)=>{
        set({isSigningUp:true})
        try {
           const res = await axiosInstance.post("/auth/signup",data); 
           toast.success("account created successfully")
           get().connectSocket();
        } catch (error) {
            toast.error(error.response.data.message);

        }finally{
            set({isSigningUp:false});
        }
    },
     login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket()
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
    logout:async()=>{
        try {
            await axiosInstance.post("auth/logout");
            set({authUser:null});
            toast.success("Logged out successfully")
            get().disconnectSocket()
        } catch (error) {
            toast.error(error.reponse.data.message);
            
        }
    },
    updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
  const { authUser, socket } = get();
  if (!authUser || socket?.connected) return;

  const socketClient = io(BASE_URL, {
    transports: ["websocket"],
    withCredentials: true,
    query: { userId: authUser._id },
  });

  socketClient.on("connect_error", (err) => {
    console.error("Socket connect error:", err);
  });

  socketClient.on("connect", () => {
    console.log("✅ Socket connected", socketClient.id);
  });

  socketClient.on("getOnlineUsers", (userIds) => {
    set({ onlineUsers: userIds });
  });

  set({ socket: socketClient });
},

  disconnectSocket:()=>{
    if (get().socket?.connected) get().socket.disconnect()    
  }


})); 
