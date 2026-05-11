export function getPublicEnv() {
  const contactPhone =
    process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || "+1 (806) 290-4949"
  const defaultSkincareUrl =
    "https://beakergold.com/?srsltid=AfmBOoryko08_1LDeogRpEWca9eUNONUfYgzEcHan-g1G7SlziXYTyvR"
  const configuredSkincareUrl = process.env.NEXT_PUBLIC_SKINCARE_URL?.trim()
  const skincareUrl =
    configuredSkincareUrl &&
    configuredSkincareUrl !== "https://beakergold.com" &&
    configuredSkincareUrl !== "https://beakergold.com/" &&
    !configuredSkincareUrl.endsWith("beakergold.com")
      ? configuredSkincareUrl
      : defaultSkincareUrl

  return { contactPhone, skincareUrl }
}
