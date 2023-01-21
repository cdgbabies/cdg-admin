import { Button, Modal } from "flowbite-react";
import React, { useState } from "react";
const ConfirmationModal =(props)=>{
    const [visible,setVisible]=useState(true);
    function onClose(){
        setVisible(false);
    }
    function onClick(){
        props.onSubmit(props.blogKey);
        onClose();

    }
    return <React.Fragment>
   
    
    <Modal
      show={visible}
      position="center"
      onClose={onClose}
    >
      
      <Modal.Body>
        <div className="space-y-3 p-3">
         Do you want to delete the selected Blog?
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClick}>
          I accept
        </Button>
        <Button
          color="gray"
          onClick={onClose}
        >
          Decline
        </Button>
      </Modal.Footer>
    </Modal>
  </React.Fragment>
}
export default ConfirmationModal;