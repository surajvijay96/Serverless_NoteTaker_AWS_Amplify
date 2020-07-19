
import React, { Component } from 'react';
import { withAuthenticator, AmplifyGreetings } from '@aws-amplify/ui-react';
import {API, graphqlOperation, Auth} from 'aws-amplify';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
 
class App extends Component{ 

  state = {
    id : "",
    note : "",
    notes : []
  }

  handleChangeNote = (event) =>{
    this.setState({note : event.target.value})
  }

  async componentDidMount(){
    const allNotes = await API.graphql(graphqlOperation (listNotes));
    this.setState({ notes : allNotes.data.listNotes.items });
  }

  hasExistingNode = () => {
    const { notes, id } = this.state;
    if(id){
      const isNote = notes.findIndex(note => note.id === id) > -1
      return isNote;
    }
    return false;
  }

  handleAddNote = async (event) => {
    const { note , notes } = this.state;
    event.preventDefault();

    if(note === ""){
      alert("Note cannot be empty..!");
      return -1;
    }

    //check if there is an existing note, if so update it
    if(this.hasExistingNode()){
      this.handleUpdatedNote();
    }
    else{
      const input = { note }
      const result = await API.graphql(graphqlOperation( createNote, { input }));
      const newNote = result.data.createNote;
      const updatedNote = [newNote, ...notes];
      this.setState({notes : updatedNote , note : ""});
    }
  };

  handleUpdatedNote = async () => {
    const { notes, id, note} = this.state;
    if(note === ""){
      alert("Note cannot be empty..!");
      return -1;
    }
    const input = { id, note };
    const result = await API.graphql(graphqlOperation( updateNote , {input}));
    const updatedNote = result.data.updateNote;
    const index = notes.findIndex( note => note.id === updatedNote.id);
    const updatedNotes = [
      ...notes.slice(0 , index),
      updatedNote,
      ...notes.slice(index+1)
    ];
    this.setState({notes : updatedNotes, note : "", id : ""});
  }

  hanleDeleteNote = async(noteId) => {
    const { notes } = this.state;
    const input = {
      id : noteId
    }
    const result = await API.graphql(graphqlOperation(deleteNote, {input}));
    const deletedNoteId = result.data.deleteNote.id;
    const updatedNote = notes.filter( note => note.id !== deletedNoteId );
    this.setState({ notes : updatedNote });
  }

  handleSetNote = ({ note, id }) => {
    this.setState({ note , id });
  }

  render(){ 

    const { id, notes, note } = this.state;

    return (
      <div className="App">
        <AmplifyGreetings username={Auth.user.attributes.email}/>
        <div style={{display: 'flex', justifyContent: 'center'}}><img src="https://i.pinimg.com/originals/52/8e/29/528e2946f76a74030660b231c7ff1dc1.png" alt="Notes" width="100" height="100"/></div>
        <div className="flex flex-column items-center justify-center pa3 bg-light-yellow">
          <h1 className = "code f2-l">Personal Note</h1>
          {/* note form */}
          <form action=" " className="mb3" onSubmit={this.handleAddNote}>
            <input type="text" className="pa2 f4" placeholder="Write your note" onChange = {this.handleChangeNote} value = { note }/>
            <button className="pa2 f4" type="submit"> { id ? "Update Note" : "Add Note" }</button>
          </form>
          {/* Notes List */}
          <div>
            {notes.map(item =>(
              <div key={item.id} className="flex items-center">
                <li className = "list pa1-f3" onClick = { () => this.handleSetNote(item) } > {item.note} </li>
                <button className ="bg-transparent bn f4" onClick = { () => this.hanleDeleteNote(item.id)}>
                  <span>&times;</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}
 
export default withAuthenticator(App);