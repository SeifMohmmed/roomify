import type { Route } from "./+types/home";
import Navbar from "../../componets/Navbar";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
      <div className="home-page">
      <Navbar />
      <h1 className="text-3xl text-indigo-500 font-bold">
        Home
      </h1>
      </div>
  )
}
