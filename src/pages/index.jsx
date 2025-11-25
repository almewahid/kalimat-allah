import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from "@/components/Layout";
import Dashboard from "./Dashboard.jsx";

const Learn = React.lazy(() => import("./Learn"));
const Quiz = React.lazy(() => import("./Quiz"));
const Progress = React.lazy(() => import("./Progress"));
const Help = React.lazy(() => import("./Help"));
const Favorites = React.lazy(() => import("./Favorites"));
const Search = React.lazy(() => import("./Search"));
const QuizTypes = React.lazy(() => import("./QuizTypes"));
const QuranReader = React.lazy(() => import("./QuranReader"));
const Groups = React.lazy(() => import("./Groups"));
const Friends = React.lazy(() => import("./Friends"));
const Leaderboard = React.lazy(() => import("./Leaderboard"));
const Achievements = React.lazy(() => import("./Achievements"));
const Shop = React.lazy(() => import("./Shop"));
const Notifications = React.lazy(() => import("./Notifications"));
const PrivacySettings = React.lazy(() => import("./PrivacySettings"));

export default function Pages() {
  return (
    <Layout>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/quiztypes" element={<QuizTypes />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/help" element={<Help />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/search" element={<Search />} />
          <Route path="/quranreader" element={<QuranReader />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/privacysettings" element={<PrivacySettings />} />
        </Routes>
      </React.Suspense>
    </Layout>
  );
}
