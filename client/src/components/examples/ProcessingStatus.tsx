import ProcessingStatus from '../ProcessingStatus';

export default function ProcessingStatusExample() {
  return <ProcessingStatus currentStep="transcribing" progress={45} />;
}
