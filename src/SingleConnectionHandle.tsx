import { Handle, HandleProps, useHandleConnections } from "@xyflow/react";

function SingleConnectionHandle(props: HandleProps) {
  const connections = useHandleConnections({
    type: props.type,
    id: props.id,
  });

  return <Handle {...props} isConnectable={connections.length === 0} />;
}

export default SingleConnectionHandle;
