const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./views/**/*.html"],
	theme: {
		extend: {
			colors: {
				"bg": "rgba(0,0,0,0.6)",
				"foxy-orange": "#fc6f53",
				"foxy-blue": "#3eb9e5",
			}
		},
	},
	plugins: [],
};