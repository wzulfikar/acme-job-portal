import Rodal from "rodal";

export default function Modal(props) {
  return (
    <>
      <style jsx global>{`
        .rodal-mask {
          background-color: #0000004d !important;
        }
        .rodal-dialog {
          margin: 1em auto !important;
        }
        .rodal-slideUp-enter {
          animation-timing-function: ease !important;
        }
      `}</style>

      <Rodal closeOnEsc={true} {...props} />
    </>
  );
}
