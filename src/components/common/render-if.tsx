interface RenderIfProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  when: boolean;
}

export const RenderIf: React.FC<RenderIfProps> = ({ children, fallback = null, when }) => (when ? children : fallback);
