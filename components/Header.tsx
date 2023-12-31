"use client";
import Image from "next/image";
import Avatar from "react-avatar";
import { MagnifyingGlassIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { useBoardStore } from "@/store/BoardStore";
import { useEffect,useState } from "react";
import fetchSuggestion from "@/lib/fetchSuggestion";
import { useUserStore } from "@/store/UserStore";
import UserModal from "./UserModal";

function Header() {
  const [modal, setModal] = useState<boolean>(false);
  const [userData, userAvatar, getAvatar] = useUserStore((state) => [
    state.user,
    state.userAvatar,
    state.getAvatar,
  ]);
  const[board,searchString,setSearchString]=useBoardStore((state)=>[
    state.board,
    state.searchString,
    state.setSearchString
  ])
  const[loading,setLoading]=useState<boolean>(false)
  const[suggestion,setSuggestion]=useState<string>("");
  useEffect(()=>{
    getAvatar(userData.$id);
     if(board.columns.size === 0)return;
     setLoading(true)

     const fetchSuggestionFunc=async()=>{
      const suggestion=await fetchSuggestion(board);
      setSuggestion(suggestion)
      setLoading(false)
     }

     fetchSuggestionFunc()
  },[board,userData,getAvatar])

  return (
    <header>
      <div className="flex flex-col md:flex-row items-center p-5 bg-gray-500/10 rounded-b-2xl">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from bg-purple-400 to pink-700 rounded-md filter blur-3xl opacity-50 -z-50"></div>
        <Image
          src="/gallery-logo.avif"
          alt="gallery logo"
          width={300}
          height={100}
          className="w-44 md:w-56 pb-10 md:pb-0 object-contain"
        />
        <div className="flex items-center space-x-5 flex-1 justify-end w-full">
          <form className="flex item-center spacex-5 bg-white rounded-md p-2 shadow-md flex-1 md:flex-inital">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="search"
              value={searchString}
              onChange={(e) => setSearchString(e.target.value)}
              className="flex-1 outline-none p-2"
            />
            <button type="submit" hidden>
              Search
            </button>
          </form>

          <Avatar name="bashir Aremu" round size="50" color="#3355d1" />
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-2 md:py-5">
        <p className="flex item-center text-sm font-light p-5 pr-5 shadow-xl rounded-xl w-fit bg-whote italic">
          <UserCircleIcon
            className={`inline-block h-10 w-10 text-[#0055d1] mr-1 ${
              loading && "animate-spin"
            }`}
          />
          {suggestion && !loading
            ? suggestion
            : "GPT is summarizing your task for you.."}
        </p>
      </div>
    </header>
  );
}

export default Header;
