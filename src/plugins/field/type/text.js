Class FieldHandler {
}
Class TextFieldHandler extends FieldHandler { 
}

Textfield.

module.exports = {
  TextField: TextField,
  plugin: function (msm) {
    msm.registerFieldHandlers(TextField);
  }
}
MSM.registerFieldHandler(TextField);
