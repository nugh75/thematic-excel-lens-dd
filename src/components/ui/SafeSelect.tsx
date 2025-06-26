import React from 'react';
import { Select, SelectItem } from './select';

interface SafeSelectProps extends React.ComponentProps<typeof Select> {
  children: React.ReactNode;
}

export const SafeSelect = ({ children, ...props }: SafeSelectProps) => {
  console.log('SafeSelect called with props:', props);
  
  React.Children.forEach(children, child => {
    if (React.isValidElement(child) && 
        child.type === SelectItem && 
        (!child.props.value || child.props.value === "")) {
      console.log('Invalid Select.Item detected - props:', child.props);
      console.error("Invalid Select.Item value detected:", {
        component: child.props.children,
        props: child.props
      });
      throw new Error("Select.Item must have a non-empty value prop");
    }
  });
  
  return <Select {...props}>{children}</Select>;
};
