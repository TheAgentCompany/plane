import { FC } from "react";
// next
import Image from "next/image";

// ui
import { PrimaryButton } from "components/ui";
// img
import JoinProjectImg from "public/join-project.svg";

export interface JoinProjectProps {
  isJoiningProject: boolean;
  handleJoin: () => void;
}

export const JoinProject: FC<JoinProjectProps> = ({ isJoiningProject, handleJoin }) => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-y-5 text-center">
    <div className="h-44 w-72">
      <Image src={JoinProjectImg} height="176" width="288" alt="JoinProject" />
    </div>
    <h1 className="text-xl font-medium text-gray-900">You are not a member of this project</h1>

    <div className="w-full max-w-md text-base text-gray-500 ">
      <p className="mx-auto w-full text-sm md:w-3/4">
        You are not a member of this project, but you can join this project by clicking the button
        below.
      </p>
    </div>
    <div>
      <PrimaryButton
        className="flex items-center gap-1"
        loading={isJoiningProject}
        onClick={handleJoin}
      >
        {isJoiningProject ? "Joining..." : "Click to join"}
      </PrimaryButton>
    </div>
  </div>
);
