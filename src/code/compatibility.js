switch (BROWSER) {
	case 'firefox':
		break
	case 'chrome':
	case 'opera':
		window.browser = window.chrome
		break
	default:
		throw Error(`Landmarks: invalid browser ${BROWSER} given.`)
}
