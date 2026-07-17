import { useState } from "react";
import ReleaseHero from "../../components/release/ReleaseHero";
import ChangeLog from "../../components/release/ChangeLog";
import { RELEASE_DATA as releaseData } from "../../utils/Constants";

function Release() {
  const [selectedVersion, setSelectedVersion] = useState(
    releaseData[0]?.version || ""
  );
  const selectedRelease =
    releaseData.find((r) => r.version === selectedVersion) || releaseData[0];

  const uniqueContributors = [];
  const usernames = new Set();

  if (selectedRelease?.entries) {
    selectedRelease.entries.forEach((entry) => {
      const contribs =
        entry.contributors || (entry.contributor ? [entry.contributor] : []);
      contribs.forEach((c) => {
        if (
          c?.username &&
          !usernames.has(c.username) &&
          c.username !== selectedRelease.author?.username
        ) {
          usernames.add(c.username);
          uniqueContributors.push(c);
        }
      });
    });
  }

  return (
    <div>
      <ReleaseHero
        selectedRelease={selectedRelease}
        contributors={uniqueContributors}
      />
      <ChangeLog
        releaseData={releaseData}
        selectedVersion={selectedVersion}
        setSelectedVersion={setSelectedVersion}
        selectedRelease={selectedRelease}
      />
    </div>
  );
}

export default Release;
