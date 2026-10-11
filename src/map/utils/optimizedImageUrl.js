
/**
 * Optimize Cloudinary image delivery without changing stored URLs.
 * Non-Cloudinary URLs and non-image resources are returned unchanged.
 */
export const getOptimizedImageUrl = (url) => {
  if (typeof url !== "string" || !url) return url;

  try {
    const parsed = new URL(url);

    if (
      parsed.hostname !== "res.cloudinary.com" ||
      !parsed.pathname.includes("/image/upload/")
    ) {
      return url;
    }

    const marker = "/image/upload/";
    const index = parsed.pathname.indexOf(marker);

    const before = parsed.pathname.slice(
      0,
      index + marker.length
    );

    const after = parsed.pathname.slice(index + marker.length);

    // Preserve existing delivery transformations.
    const firstSegment = after.split("/")[0];
    const hasTransformation =
      /^(f_|q_|w_|h_|c_|dpr_|e_|fl_)/.test(firstSegment) ||
      firstSegment.includes(",");

    if (hasTransformation) {
      return url;
    }

    parsed.pathname = `${before}f_auto,q_auto/${after}`;

    return parsed.toString();
  } catch {
    return url;
  }
};
