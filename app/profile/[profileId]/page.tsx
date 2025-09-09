"use client";
import React from "react";
import Profile from "@/components/Profile/Profile";
import { useParams } from "next/navigation";

const ProfilePage = () => {
  const { profileId } = useParams();
  return <Profile profileId={profileId as string} />;
};

export default ProfilePage;
