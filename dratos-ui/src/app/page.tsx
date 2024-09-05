import Image from "next/image";
import dynamic from 'next/dynamic';
import WorkflowOrdinalNFTComponent from "./components/WorkflowOrdinalNFTComponent";

const Diagram = dynamic(() => import('./components/Diagram'), { ssr: false });
const ChatBot = dynamic(() => import('./components/Chatbot'), { ssr: false });

export default function Home() {
  return (
    <div>
      <h1>Dratos UI</h1>
      {/* <WorkflowOrdinalNFTComponent /> */}
      <Diagram />
      {/* <ChatBot /> */}
    </div>
  );
}
