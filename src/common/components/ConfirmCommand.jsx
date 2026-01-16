import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

export default function ConfirmCommand({
  openConfirm,
  setOpenConfirm,
  actions,
}) {
  const handleClose = () => {
    setOpenConfirm(false);
  };

  return (
    <React.Fragment>
      <Dialog
        PaperProps={{
          sx: {
            maxWidth: "450px",
            width: "90%",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: 3,
            marginLeft: 0,
          },
        }}
        open={openConfirm}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>{"Atenção"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-slide-description">
            <p>
              Ao bloquear o veículo em localidade que tem pouco sinal de rede,
              corre o risco de ter que acionar um técnico ou reboque para levar
              seu veículo à uma área de cobertura de rede melhor para
              desbloquear.
            </p>
            <p>
              <strong>Deseja enviar comando?</strong>
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 0,
            paddingBottom: 25,
            paddingLeft: 25,
            paddingRight: 25,
          }}
        >
          {actions}
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
