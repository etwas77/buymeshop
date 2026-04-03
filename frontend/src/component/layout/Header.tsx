
export interface HeaderProps {
  title: string;
};

const Header = (p: HeaderProps) => {
const { title } = p;
  return (
    <div>{title}</div>
  );
};

export default Header;