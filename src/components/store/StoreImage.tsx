"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/image-paths";

type Props = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
};

/** Local-first image with fallback; unoptimized avoids slow/blocked remote optimizers. */
export function StoreImage({ src, alt, onError, ...props }: Props) {
  const [current, setCurrent] = useState(src || DEFAULT_PRODUCT_IMAGE);

  return (
    <Image
      {...props}
      src={current}
      alt={alt}
      unoptimized
      onError={(e) => {
        if (current !== DEFAULT_PRODUCT_IMAGE) setCurrent(DEFAULT_PRODUCT_IMAGE);
        onError?.(e);
      }}
    />
  );
}
