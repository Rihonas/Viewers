import React from 'react';
import BottomPanelOpen from './BottomPanelOpen';
import BottomPanelClose from './BottomPanelClose';
type IconProps = React.HTMLAttributes<SVGElement>;
type ImageIconProps = React.ImgHTMLAttributes<HTMLImageElement>;

const ImageWrapper = ({ src, ...props }: { src: string } & ImageIconProps) => {
  return (
    <img
      src={src}
      {...props}
      alt=""
    />
  );
};

export const Icons = {
  BottomPanelOpen,
  BottomPanelClose,

  /** Adds an icon to the set of icons */
  addIcon: (name: string, icon) => {
    if (Icons[name]) {
      console.warn('Replacing icon', name);
    }
    Icons[name] = icon;
  },

  ByName: ({ name, className, ...props }: { name: string; className?: string }) => {
    const IconComponent = Icons[name];

    if (!IconComponent) {
      console.debug(`Icon "${name}" not found.`);
      return <div>Missing Icon</div>;
    }

    return (
      <IconComponent
        {...props}
        className={className}
      />
    );
  },
};
