function normalizeIdentityValue(value) {
  return String(value || "").trim().toLowerCase();
}

export function isCommentFromCurrentUser(comment, user) {
  const author = comment?.author;
  const authorId = author?.id == null ? "" : String(author.id);
  const userId = user?.id == null ? "" : String(user.id);
  const authorName = normalizeIdentityValue(
    author?.name ||
      [author?.firstName, author?.lastName].filter(Boolean).join(" "),
  );
  const userName = normalizeIdentityValue(
    user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" "),
  );
  const authorEmail = normalizeIdentityValue(author?.email);
  const userEmail = normalizeIdentityValue(user?.email);

  return Boolean(
    (authorId && userId && authorId === userId) ||
      (authorEmail && userEmail && authorEmail === userEmail) ||
      (authorName && userName && authorName === userName),
  );
}

export function getCommentAuthorAvatarSrc(comment, user) {
  if (isCommentFromCurrentUser(comment, user)) {
    return user?.profilePhotoUrl || comment?.author?.profilePhotoUrl || "";
  }

  return comment?.author?.profilePhotoUrl || comment?.avatarSrc || "";
}
