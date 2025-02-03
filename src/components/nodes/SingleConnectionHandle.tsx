import { Handle, HandleProps, useHandleConnections } from "@xyflow/react";
import { forwardRef } from "react";

const SingleConnectionHandle = forwardRef<HTMLDivElement, HandleProps>(
  (props, forwardedRef) => {
    const connections = useHandleConnections({
      type: props.type,
      id: props.id,
    });

    return (
      <Handle
        {...props}
        ref={forwardedRef}
        isConnectable={connections.length === 0}
      />
    );
  }
);

export default SingleConnectionHandle;
