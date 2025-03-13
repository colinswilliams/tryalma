import bg from '@/public/images/background-pattern.png'

export default function Header({ children }: { children: React.ReactNode }) {
	return (
		<header className="bg-pattern bg-no-repeat bg-left mb-16 md:min-h-[23.125rem]" style={{ backgroundImage: `url(${bg.src})` }}>
			{children}
		</header>
	);
}