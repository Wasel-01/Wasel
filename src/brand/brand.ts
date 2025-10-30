export const brand = {
	name: "Wassel",
	logo: {
		primarySvg: () => new URL("../assets/logo.svg", import.meta.url).toString(),
		preferOriginal: true,
		originalPublicPath: "/logo.png",
		alt: "Wassel",
		sizes: {
			xs: { heightClass: "h-7" },
			sm: { heightClass: "h-8" },
			md: { heightClass: "h-10" },
			lg: { heightClass: "h-12" },
			xl: { heightClass: "h-16" },
		},
	},
	colors: {
		primary: "#008080",
		primaryDark: "#006a6a",
		secondary: "#607D4B",
		accent: "#880044",
		foreground: "#0f172a",
	},
	taglineEn: "Share Your Journey",
	taglineAr: "واصل",
};
