const LINK_TOKEN = "->";

export function isLink(entry: string) {
  const linkParts = entry.split(LINK_TOKEN);
  return linkParts.length === 2;
}

export function getLinkParts(entry: string) {
  const linkParts = entry.split(LINK_TOKEN);
  const entryName = linkParts[0].trim().replace(/"|'/g, "");
  const linkTarget = linkParts[1].trim().replace(/"|'/g, "");

  return {
    entryName,
    linkTarget
  };
}
