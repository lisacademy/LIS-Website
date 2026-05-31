import type { EventItem } from "./eventsDb";

export type EventGallerySlug = "lisacon-series" | "tech-vc-conclaves" | "distinguished-lectures" | "other-events";

export interface EventGallery {
  slug: EventGallerySlug;
  title: string;
  sourceUrl: string;
  images: string[];
}

const lisaconImages = [
  "https://static.wixstatic.com/media/4c9702_5ba7b03bf62a4fb6a3dbcd22f9f9931f~mv2.jpeg/v1/fit/w_480,h_680,q_90,enc_avif,quality_auto/4c9702_5ba7b03bf62a4fb6a3dbcd22f9f9931f~mv2.jpeg",
  "https://static.wixstatic.com/media/4c9702_a046653287664b3a815188549da38c40~mv2.jpg/v1/fit/w_1440,h_961,q_90,enc_avif,quality_auto/4c9702_a046653287664b3a815188549da38c40~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_10facdeb1493473fb43793d66c4b1780~mv2.jpg/v1/fit/w_960,h_637,q_90,enc_avif,quality_auto/4c9702_10facdeb1493473fb43793d66c4b1780~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_14fc3d1425b84fa18179fcc5b0439525~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_14fc3d1425b84fa18179fcc5b0439525~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_809dfa16bbe740c684028964f177c15d~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_809dfa16bbe740c684028964f177c15d~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_99b27a9c993e42e1b80daa9a577bcb12~mv2.png/v1/fit/w_960,h_479,q_90,enc_avif,quality_auto/4c9702_99b27a9c993e42e1b80daa9a577bcb12~mv2.png",
  "https://static.wixstatic.com/media/4c9702_838ce86278024b519272ad157a7d187b~mv2.png/v1/fit/w_858,h_1150,q_90,enc_avif,quality_auto/4c9702_838ce86278024b519272ad157a7d187b~mv2.png",
  "https://static.wixstatic.com/media/4c9702_60cd5e05ae174cadab0b6ca7de5b7d2f~mv2.jpg/v1/fit/w_960,h_679,q_90,enc_avif,quality_auto/4c9702_60cd5e05ae174cadab0b6ca7de5b7d2f~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_ce7bcfb6a9154c119832942ced38eba5~mv2.jpg/v1/fit/w_960,h_680,q_90,enc_avif,quality_auto/4c9702_ce7bcfb6a9154c119832942ced38eba5~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_a9258cbc0559426c8ea6dd9c0676489e~mv2.jpg/v1/fit/w_960,h_679,q_90,enc_avif,quality_auto/4c9702_a9258cbc0559426c8ea6dd9c0676489e~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_0719b4268fd445bd8dba770ab7f38114~mv2.jpg/v1/fit/w_960,h_680,q_90,enc_avif,quality_auto/4c9702_0719b4268fd445bd8dba770ab7f38114~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_9534118b76de4e06878bdbf38e7c4e45~mv2.jpg/v1/fit/w_960,h_679,q_90,enc_avif,quality_auto/4c9702_9534118b76de4e06878bdbf38e7c4e45~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_ee886ce3364c49d99d59033da1ede409~mv2.jpg/v1/fit/w_960,h_680,q_90,enc_avif,quality_auto/4c9702_ee886ce3364c49d99d59033da1ede409~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_6b678019f26b4591894b171ecbaa7012~mv2.jpg/v1/fit/w_960,h_679,q_90,enc_avif,quality_auto/4c9702_6b678019f26b4591894b171ecbaa7012~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_838ce7bbb5c44c519aab73e3790ad3e9~mv2.png/v1/fit/w_480,h_677,q_90,enc_avif,quality_auto/4c9702_838ce7bbb5c44c519aab73e3790ad3e9~mv2.png",
  "https://static.wixstatic.com/media/4c9702_43b0f1abea8746ebb1648dc0ff17b590~mv2.jpg/v1/fit/w_1440,h_960,q_90,enc_avif,quality_auto/4c9702_43b0f1abea8746ebb1648dc0ff17b590~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_451de27dbf04437b80cfb7ae940f4a3d~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_451de27dbf04437b80cfb7ae940f4a3d~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_1a4babfe7d4f4b9cb6ecfea66c23dc57~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_1a4babfe7d4f4b9cb6ecfea66c23dc57~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_7ee7f8a269ad4faea697523dafeb271d~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_7ee7f8a269ad4faea697523dafeb271d~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_876bba12ce074bcb8d1071e4d0f5cc32~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_876bba12ce074bcb8d1071e4d0f5cc32~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_b55c7a56f9e646c49d90eefb8ffa374b~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_b55c7a56f9e646c49d90eefb8ffa374b~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_466e79fad2864bd88c5f583be4ffb514~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_466e79fad2864bd88c5f583be4ffb514~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_61b112532bed4140a5ff0ec8a998aae2~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_61b112532bed4140a5ff0ec8a998aae2~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_56a650f78a3e4c7599b65cd6e08fde9b~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_56a650f78a3e4c7599b65cd6e08fde9b~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_d6dc1614b16141bfbab150a3e3c77d26~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_d6dc1614b16141bfbab150a3e3c77d26~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_785df5f9c2234529ab3c5cd69e78907a~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_785df5f9c2234529ab3c5cd69e78907a~mv2.jpg",
];

const techVcImages = [
  "https://static.wixstatic.com/media/4c9702_a3f82175403f43669d10c930f701cace~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_a3f82175403f43669d10c930f701cace~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_264149b6ded4459f818803875086b0aa~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_264149b6ded4459f818803875086b0aa~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_384f8e3628e64b16bf62bb124ddf30fc~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_384f8e3628e64b16bf62bb124ddf30fc~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_e5c87510a84747e199b73f3b7e49ca06~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_e5c87510a84747e199b73f3b7e49ca06~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_95d99de6d0504e01affdc6bedc0ced0c~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_95d99de6d0504e01affdc6bedc0ced0c~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_0763ae1bbf0a49feb9bf55e5d9d168eb~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_0763ae1bbf0a49feb9bf55e5d9d168eb~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_92baa081ec5c4a6694f59d840275f1e2~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_92baa081ec5c4a6694f59d840275f1e2~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_aad8c9c866084f5c89618227a53d699b~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_aad8c9c866084f5c89618227a53d699b~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_76925af1ba814102a953a095817cad3b~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_76925af1ba814102a953a095817cad3b~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_520b62417e7a4e9fa589f8c61515ae5a~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_520b62417e7a4e9fa589f8c61515ae5a~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_3d0c85a6e0ea4ee9baff6341db5df7ce~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_3d0c85a6e0ea4ee9baff6341db5df7ce~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_7409735ce6d946a5b64075e448f52d81~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_7409735ce6d946a5b64075e448f52d81~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_b233c4c5b1574f0a9393caf9d4f33ab8~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_b233c4c5b1574f0a9393caf9d4f33ab8~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_b7d359a7d2904e89b7813d6fd7b2da36~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_b7d359a7d2904e89b7813d6fd7b2da36~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_9edabd876eb1467eb53d1083a6f524a9~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_9edabd876eb1467eb53d1083a6f524a9~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_dbc48f283d8742e2b1c6bbc1e456c3a0~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_dbc48f283d8742e2b1c6bbc1e456c3a0~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_0fa84613bda6482cb345b54eedfc3eeb~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_0fa84613bda6482cb345b54eedfc3eeb~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_46097a029524429ca1b7b51814382778~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_46097a029524429ca1b7b51814382778~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_e2daea1d2b8b4943b8c14e1bd81ffa60~mv2.jpg/v1/fit/w_960,h_640,q_90,enc_avif,quality_auto/4c9702_e2daea1d2b8b4943b8c14e1bd81ffa60~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_bd25c5a2dbdd4b64bf98eecf52eed4a9~mv2.jpg/v1/fit/w_960,h_639,q_90,enc_avif,quality_auto/4c9702_bd25c5a2dbdd4b64bf98eecf52eed4a9~mv2.jpg",
];

const lectureImages = [
  "https://static.wixstatic.com/media/4c9702_81c85ddc47d14fa1990dbee9b7303b62~mv2.jpeg/v1/fit/w_960,h_683,q_90,enc_avif,quality_auto/4c9702_81c85ddc47d14fa1990dbee9b7303b62~mv2.jpeg",
  "https://static.wixstatic.com/media/4c9702_b283ce5b46d6446ba2447d64efd9b65b~mv2.jpg/v1/fit/w_960,h_678,q_90,enc_avif,quality_auto/4c9702_b283ce5b46d6446ba2447d64efd9b65b~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_d0c942e76aaa43e88762018124dba262~mv2.jpeg/v1/fill/w_487,h_689,q_90,enc_avif,quality_auto/4c9702_d0c942e76aaa43e88762018124dba262~mv2.jpeg",
  "https://static.wixstatic.com/media/4c9702_5de9428e1f7a49959eadee0f3079e7a9~mv2.jpg/v1/fill/w_489,h_689,q_90,enc_avif,quality_auto/4c9702_5de9428e1f7a49959eadee0f3079e7a9~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_4bdfb8c1de4e4c30919548f8e987e223~mv2.jpg/v1/fill/w_487,h_689,q_90,enc_avif,quality_auto/4c9702_4bdfb8c1de4e4c30919548f8e987e223~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_019a9ece9fa445f6ab24883f13064427~mv2.jpg/v1/fill/w_488,h_689,q_90,enc_avif,quality_auto/4c9702_019a9ece9fa445f6ab24883f13064427~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_6944fe89fbfc473bba1c4a9e38f62649~mv2.jpg/v1/fill/w_487,h_689,q_90,enc_avif,quality_auto/4c9702_6944fe89fbfc473bba1c4a9e38f62649~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_792945074787475c8e5ca4dbf0e9a191~mv2.jpg/v1/fill/w_488,h_689,q_90,enc_avif,quality_auto/4c9702_792945074787475c8e5ca4dbf0e9a191~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_ff20ccc380044a0292a22f9079fbbaac~mv2.jpg/v1/fill/w_487,h_689,q_90,enc_avif,quality_auto/4c9702_ff20ccc380044a0292a22f9079fbbaac~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_2b184d85d98d4cbf9238cfbf88c97fb8~mv2.jpg/v1/fill/w_488,h_689,q_90,enc_avif,quality_auto/4c9702_2b184d85d98d4cbf9238cfbf88c97fb8~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_ee9f3ebbf18344dbb257f7b38c2c9d43~mv2.jpg/v1/fit/w_480,h_678,q_90,enc_avif,quality_auto/4c9702_ee9f3ebbf18344dbb257f7b38c2c9d43~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_4aab79f1c688410cb9192f2ef28a7c3f~mv2.jpg/v1/fit/w_480,h_678,q_90,enc_avif,quality_auto/4c9702_4aab79f1c688410cb9192f2ef28a7c3f~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_3c417e0f00d148138dcb83fea54e48b9~mv2.jpg/v1/fit/w_480,h_678,q_90,enc_avif,quality_auto/4c9702_3c417e0f00d148138dcb83fea54e48b9~mv2.jpg",
  "https://static.wixstatic.com/media/4c9702_0a2ea337493c4dc59de7b23aba9614d1~mv2.jpeg/v1/fill/w_428,h_600,q_90,enc_avif,quality_auto/4c9702_0a2ea337493c4dc59de7b23aba9614d1~mv2.jpeg",
  "https://static.wixstatic.com/media/4c9702_48b573cb481a48da92312af1b147fca1~mv2.jpeg/v1/fill/w_406,h_600,q_90,enc_avif,quality_auto/4c9702_48b573cb481a48da92312af1b147fca1~mv2.jpeg",
];

export const eventGalleries: EventGallery[] = [
  {
    slug: "lisacon-series",
    title: "LISACON Series",
    sourceUrl: "https://www.lisacon.org/copy-of-distiguished-lectures",
    images: lisaconImages,
  },
  {
    slug: "tech-vc-conclaves",
    title: "Tech VC Conclaves",
    sourceUrl: "https://www.lisacon.org/copy-of-lisacon",
    images: techVcImages,
  },
  {
    slug: "distinguished-lectures",
    title: "Distinguished Lectures",
    sourceUrl: "https://www.lisacon.org/copy-of-tech-vc-conclaves",
    images: lectureImages,
  },
  {
    slug: "other-events",
    title: "Other Events",
    sourceUrl: "https://www.lisacon.org/copy-of-home",
    images: lisaconImages,
  },
];

export function getGalleryBySlug(slug: string | undefined) {
  return eventGalleries.find((gallery) => gallery.slug === slug);
}

export function getEventGallerySlug(event: EventItem): EventGallerySlug {
  const title = event.title.toLowerCase();
  const type = event.type.toLowerCase();

  if (title.includes("tech vc") || type.includes("tech vc")) return "tech-vc-conclaves";
  if (title.includes("distinguished lecture") || type.includes("distinguished lecture") || type.includes("lecture series")) return "distinguished-lectures";
  if (title.includes("lisacon") || title.includes("lis academy conference") || type.includes("conference")) return "lisacon-series";
  return "other-events";
}

export function slugifyEventTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getEventGalleryLabel(event: EventItem) {
  const title = event.title.toLowerCase();
  const gallerySlug = getEventGallerySlug(event);

  if (gallerySlug === "lisacon-series") {
    if (title.includes("1st")) return "1st LISACON";
    if (title.includes("2nd")) return "2nd LISACON";
    if (title.includes("3rd")) return "3rd LISACON";
    if (title.includes("4th")) return "4th LISACON";
    if (title.includes("5th")) return "5th LISACON";
  }

  if (gallerySlug === "tech-vc-conclaves") {
    if (title.includes("1st")) return "1st Tech VC Conclave";
    if (title.includes("2nd")) return "2nd Tech VC Conclave";
    if (title.includes("3rd")) return "3rd Tech VC Conclave";
  }

  return event.title;
}

export function getEventGallerySourceUrl(event: EventItem) {
  return getGalleryBySlug(getEventGallerySlug(event))?.sourceUrl || "https://www.lisacon.org/copy-of-home";
}

function getLisaconImages(event: EventItem) {
  const title = event.title.toLowerCase();
  if (title.includes("5th")) return [lisaconImages[0], ...lisaconImages.slice(21, 26)].filter(Boolean);
  if (title.includes("4th")) return lisaconImages.slice(15, 21);
  if (title.includes("3rd")) return lisaconImages.slice(10, 15);
  if (title.includes("2nd")) return lisaconImages.slice(5, 10);
  if (title.includes("1st")) return lisaconImages.slice(1, 6);
  return lisaconImages.slice(0, 8);
}

function getTechVcImages(event: EventItem) {
  const title = event.title.toLowerCase();
  if (title.includes("3rd")) return techVcImages.slice(13, 20);
  if (title.includes("2nd")) return techVcImages.slice(6, 13);
  return techVcImages.slice(0, 7);
}

function getLectureImages(event: EventItem) {
  const title = event.title.toLowerCase();
  if (title.includes("5th")) return [lectureImages[0], lectureImages[14], lectureImages[9]].filter(Boolean);
  if (title.includes("4th")) return [lectureImages[11], lectureImages[8], lectureImages[7]].filter(Boolean);
  if (title.includes("3rd")) return [lectureImages[10], lectureImages[6], lectureImages[5]].filter(Boolean);
  if (title.includes("2nd")) return [lectureImages[1], lectureImages[4], lectureImages[3]].filter(Boolean);
  if (title.includes("1st")) return [lectureImages[0], lectureImages[2], lectureImages[13]].filter(Boolean);
  return lectureImages;
}

export function getEventGalleryImages(event: EventItem) {
  const gallerySlug = getEventGallerySlug(event);
  if (gallerySlug === "tech-vc-conclaves") return getTechVcImages(event);
  if (gallerySlug === "distinguished-lectures") return getLectureImages(event);
  if (gallerySlug === "lisacon-series") return getLisaconImages(event);
  return lisaconImages.slice(0, 8);
}

export function getEventGalleryPath(event: EventItem) {
  return `/events/gallery/${getEventGallerySlug(event)}/${slugifyEventTitle(event.title)}`;
}
