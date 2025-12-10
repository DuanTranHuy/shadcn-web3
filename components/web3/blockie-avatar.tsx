"use client";

import * as React from "react";
import { blo } from "blo";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type BlockieAvatarProps = React.ComponentProps<typeof Avatar> & {
  address: `0x${string}`;
  ensImage?: string;
  size?: number;
};

function BlockieAvatar({
  address,
  ensImage,
  size = 32,
  className,
  ...props
}: BlockieAvatarProps) {
  const blockieUrl = blo(address);

  return (
    <Avatar
      className={cn(className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <AvatarImage
        src={ensImage || blockieUrl}
        alt={`${address} avatar`}
      />
    </Avatar>
  );
}

export { BlockieAvatar };
