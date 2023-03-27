import type { NextApiRequest, NextApiResponse } from "next";

// jitsu
import { createClient } from "@jitsu/nextjs";
import { convertCookieStringToObject } from "lib/cookie";

const jitsu = createClient({
  key: process.env.JITSU_ACCESS_KEY || "",
  tracking_host: "https://t.jitsu.com",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { eventName, extra } = req.body;

  if (!eventName) {
    return res.status(400).json({ message: "Bad request" });
  }

  const cookie = convertCookieStringToObject(req.headers.cookie);
  const accessToken = cookie?.accessToken;

  const user = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then((res) => res.json())
    .then((data) => data.user);

  // TODO: cache user info

  jitsu
    .id({
      ...user,
    })
    .then(() => {
      jitsu.track(eventName, {
        ...extra,
      });
    });

  res.status(200).json({ message: "success" });
}
