


function handleAddFields(inputFields: any,setInputFields: any) {
  console.log(inputFields);
  setInputFields([...inputFields, { link: '' }]);
};

function handleRemoveFields(index: number,inputFields: any,setInputFields: any){
  const values = [...inputFields];
  values.splice(index, 1);
  setInputFields(values);
};
function handleInputChange (index: number, event: any,inputFields: any,setInputFields: any){
  const values = [...inputFields];
  values[index] = {
    ...values[index],
    [event.target.name]: event.target.value
  };
  setInputFields(values);
};
export {handleAddFields,handleRemoveFields,handleInputChange}