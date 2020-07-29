class DOMHelper {
   static clearEventListener(elem) {
      const clonedElem = elem.cloneNode(true);
      elem.replaceWith(clonedElem);
      return clonedElem;
   }

   static moveElement(elementID, newDestinationSelector) {
      const elem = document.getElementById(elementID);
      const newDestination = document.querySelector(newDestinationSelector);
      newDestination.append(elem);
   }
}

class Component {
   unshow() {
      this.elem.remove();
   }

   show() {
      document.body.append(this.elem);
   }
}

class Tooltip extends Component {
   constructor(closeNotifierFunction) {
      super();
      this.closeNotifier = closeNotifierFunction;
      this.create();
   }

   close = () => {
      this.unshow();
      this.closeNotifier();
   };

   create() {
      const tooltipElement = document.createElement('div');
      tooltipElement.className = 'card';
      tooltipElement.textContent = 'Test';
      this.elem = tooltipElement;
      tooltipElement.addEventListener('click', this.close);
   }
}

class ProjectItem {
   hasActiveTooltip = false;

   constructor(id, updateProjectListsFunction, type) {
      this.id = id;
      this.updateProjectListsHandler = updateProjectListsFunction;
      this.connectMoreInfoButton();
      this.connectSwitchButton(type);
   }

   showMoreInfoHandler() {
      if (this.hasActiveTooltip) {
         return;
      }
      const tooltip = new Tooltip(() => {
         this.hasActiveTooltip = false;
      });
      tooltip.show();
      this.hasActiveTooltip = true;
   }

   connectMoreInfoButton() {
      const projectElement = document.getElementById(this.id);
      const moreInfoButton = projectElement.querySelector(
         'button:first-of-type'
      );
      moreInfoButton.addEventListener('click', this.showMoreInfoHandler);
   }

   connectSwitchButton(type) {
      const projectElement = document.getElementById(this.id);
      let switchButton = projectElement.querySelector('button:last-of-type');
      switchButton.textContent = type === 'active' ? 'Finish' : 'Activate';
      switchButton = DOMHelper.clearEventListener(switchButton);
      switchButton.addEventListener(
         'click',
         this.updateProjectListsHandler.bind(null, this.id)
      );
   }

   update(updateProjectListsFunction, type) {
      this.updateProjectListsHandler = updateProjectListsFunction;
      this.connectSwitchButton(type);
   }
}

class ProjectList {
   projects = [];

   constructor(type) {
      this.type = type;
      const projectItems = document.querySelectorAll(`#${type}-projects li`);
      for (const projectItem of projectItems) {
         this.projects.push(
            new ProjectItem(
               projectItem.id,
               this.switchProject.bind(this),
               this.type
            )
         );
      }
   }

   setSwitchHandlerFunction(switchHandlerFunction) {
      this.switchHandler = switchHandlerFunction;
   }

   addProject(project) {
      this.projects.push(project);
      DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
      project.update(this.switchProject.bind(this), this.type);
   }

   switchProject(projectID) {
      // const projectIndex = this.projects.findIndex((p) => p.id === projectID);
      // this.projects.splice(projectIndex, 1);
      this.switchHandler(this.projects.find((p) => p.id === projectID));
      this.projects = this.projects.filter((p) => p.id !== projectID);
   }
}

class App {
   static play() {
      const activeProjectsList = new ProjectList('active');
      const finishedProjectsList = new ProjectList('finished');
      activeProjectsList.setSwitchHandlerFunction(
         finishedProjectsList.addProject.bind(finishedProjectsList)
      );
      finishedProjectsList.setSwitchHandlerFunction(
         activeProjectsList.addProject.bind(activeProjectsList)
      );
      console.log(activeProjectsList)
   }
}

App.play();
