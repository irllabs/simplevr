Active branch for redesign is `react-migration`, together with irl-ui as a git submodule added to simple-vr repo, irl-ui active branch with latest changes is master.

All the legacy angular code is still in repository and should be deleted once redesing is completed.

Entry point file for new UI is `src/index.tsx`. Application is bundled using webpack, you can refer to readme.md file inside repository to see how to build/deploy the app.

Currently implemented parts of the UI are:
1. Homepage with option to create new story.
2. Sign in/up dialog.
3. User profile dialog.
4. User stories with added pagination.
5. Public stories with added pagination.
6. Share story dialog for sharing and making user stories public.
7. Story card that represents story data in the UI.

For irl-ui, following componenets exist, and they are located inside irl-ui submodule directory at /src/irl-ui.
1. Audio selector - option to select and record audio, with audio preview.
2. Border button - button element with simple border.
3. Button- Standard button filled with primatry color.
4. Checkbox - Toggle button with on/off state.
5. Fab - fab element with expand functionality that shows additional options when user clicks on a fab.
6. Icon label button - button with icon and a label below the icon.
7. Icon - svg icons wrapped in react class component to make it easier to change svg style using props.
8. Info button - Button with additional info in it.
9. Input - text input element with support for invalid input, invalid email, different types on content, like text, password, email.
10. Profile Icon - simple UI element containing user profile image, should be used as an avatar badge.
11. Sign in - collection of sign in/up dialogs with support for google sign in.
12. Slider - slider element allowing user to specify value with a slider.
13. Spacer - simple invisible UI element user to add spacing between different UI elements.
14. Typography - component for displaying text, with predefined text styles and colors.
15. Theme - React context system for specifying irl-ui theme, using this system developer can specify irl-ui theme like colors, so if irl-ui is used for different applications, each application can specify custom color theme.

What remains to be done:
1. Story toolbar - for editing, saving and publishing the story.
2. Button for entering VR mode.
3. Edit room dialog menu.
4. Expandable rooms dialog for adding rooms in a story.
5. Fullscreen button.
6. Buttons for entering 3D/2D edit mode.
7. Edit hotspot dialog menu.
8. Tooltips across the UI. - check Dranimate repository for tooltip UI element (move it to irl-ui for easier portability).

I added comments in some parts of the code, but most of the code so far should be self explanatory, if you have any questions please email me at lazar.mitic@outlook.com.

