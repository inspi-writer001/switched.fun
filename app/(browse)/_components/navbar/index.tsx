import { Logo } from "./logo";
import { Search } from "./search";
import { Actions } from "./actions";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full h-20 z-[49] bg-black px-2 lg:px-4 flex justify-between items-center border-b border-b-gray-700">
      <Logo />
      <Search />
      {/* <div className="flex items-center gap-2"> */}
        <Actions />
      {/* </div> */}
    </nav>
  );
};
