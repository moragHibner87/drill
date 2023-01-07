import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSRPlugin,
    SSAOPlugin,
    BloomPlugin,
    Vector3, GammaCorrectionPlugin, MeshBasicMaterial2, Color
} from "webgi";
import "./styles.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger)

async function setupViewer(){

    // Initialize the viewer
    const viewer = new ViewerApp({
        canvas: document.getElementById('webgi-canvas') as HTMLCanvasElement,
        useRgbm: false
    })

    // Add some plugins
    const manager = await viewer.addPlugin(AssetManagerPlugin)
    const camera = viewer.scene.activeCamera
    const position = camera.position
    const target = camera.target
    const exitButton = document.querySelector('.bt-exit') as HTMLElement
    const customizerInterface = document.querySelector('.customizer--container') as HTMLElement

    // Add plugins individually.
    await viewer.addPlugin(GBufferPlugin)
    await viewer.addPlugin(new ProgressivePlugin(32))
    await viewer.addPlugin(new TonemapPlugin(true))
    await viewer.addPlugin(GammaCorrectionPlugin)
    await viewer.addPlugin(SSRPlugin)
    await viewer.addPlugin(SSAOPlugin)
    await viewer.addPlugin(BloomPlugin)

    viewer.renderer.refreshPipeline()

    // Add some UI for tweak and testing.
    // const uiPlugin = await viewer.addPlugin(TweakpaneUiPlugin)
    // // Add plugins to the UI to see their settings.
    // uiPlugin.setupPlugins<IViewerPlugin>(TonemapPlugin, CanvasSnipperPlugin)

    await manager.addFromPath("./assets/drill3.glb")

    const drillMaterial = manager.materials!.findMaterialsByName('Drill_01')[0] as MeshBasicMaterial2

    viewer.getPlugin(TonemapPlugin)!.config!.clipBackground = true // in case its set to false in the glb

    viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})

    onUpdate()

    function setupScrollAnim(){
        const tl = gsap.timeline()
    
        //first sec
        tl.to(position, {x: 1.56, y:-2.26, z: -3.85, duration: 1,
            scrollTrigger: {
                trigger: ".section-2",
                start: 'top bottom',
                end: 'top top',
                scrub: 1,
                immediateRender: false
         }, onUpdate })
         .to('.section-1 .container', {xPercent: '-150',opacity: 0, duration: 1,
            scrollTrigger: {
                trigger: ".section-2",
                start: 'top bottom',
                end: 'top center',
                scrub: 1,
                immediateRender: false
    
         } })
        .to(target, {x: -1.37, y:1.99, z: -0.37, duration: 1,
            scrollTrigger: {
                trigger: ".section-2",
                start: 'top bottom',
                end: 'top top',
                scrub: 1,
                immediateRender: false
    
         } })

         //Last sec
        .to(position, {x: -3.4, y:0.6, z: 1.71, duration: 1,
            scrollTrigger: {
                trigger: ".section-3",
                start: 'top bottom',
                end: 'top top',
                scrub: 1,
                immediateRender: false

         }, onUpdate })
        .to(target, {x: -1.5, y:2.13, z: -0.4, duration: 1,
            scrollTrigger: {
                trigger: ".section-3",
                start: 'top bottom',
                end: 'top top',
                scrub: 1,
                immediateRender: false
    
         } })
    }
    setupScrollAnim()

    //webgi update
    let needsUpdates = true;
    function onUpdate(){
        needsUpdates = true
        //viewer.renderer.resetShadows()
        viewer.setDirty()
    }

    viewer.addEventListener('preFrame', () => {
        if(needsUpdates){
            camera.positionTargetUpdated(true)
            needsUpdates = false
        }
    })

    //btn scroll next sec
    document.querySelector('.hero-btn')?.addEventListener('click', () => {
        const el = document.querySelector('.section-2')
        window.scrollTo({top: el?.getBoundingClientRect().top, behavior: 'smooth'})
    })

    //btn back top
    document.querySelector('.bt-backTop')?.addEventListener('click', () => {
        window.scrollTo({top: 0, behavior: 'smooth'})
    })

    //customize
    const main = document.querySelector('.main') as HTMLElement
    const mainContainer = document.getElementById('webgi-canvas-container') as HTMLElement
    document.querySelector('.bt-custom')?.addEventListener('click', () => {
        main.style.visibility = 'hidden';
        mainContainer.style.pointerEvents = 'all';
        document.body.style.cursor = 'grab';

        gsap.to(position, {x: -2.6, y: 0.2, z: -9.6, duration: 2, ease: "power3.inOut", onUpdate});
        gsap.to(target, {x: -0.15, y: 1.18 , z: 0.12, duration: 2, ease: "power3.inOut", onUpdate, onComplete: enableControlers})
    })

    function enableControlers(){
        exitButton.style.visibility = "visible"
        customizerInterface.style.visibility = "visible"
        viewer.scene.activeCamera.setCameraOptions({controlsEnabled: true})
    }

    // EXIT CUSTOMIZER
	exitButton.addEventListener('click', () => {
        gsap.to(position, {x: -3.4, y:0.6, z: 1.71, duration: 1, ease: "power3.inOut", onUpdate})
        gsap.to(target, {x: -1.5, y:2.13, z: -0.4, duration: 1, ease: "power3.inOut", onUpdate})

        viewer.scene.activeCamera.setCameraOptions({controlsEnabled: false})
        main.style.visibility = "visible"
        mainContainer.style.pointerEvents = "none"
        document.body.style.cursor = "default"
        exitButton.style.visibility = "hidden"
        customizerInterface.style.visibility = "hidden"
	})

    document.querySelector('.button--colors.black')?.addEventListener('click', () => {
		changeColor(new Color(0x383830).convertSRGBToLinear())
    })

    document.querySelector('.button--colors.red')?.addEventListener('click', () => {
		changeColor(new Color(0xfe2d2d).convertSRGBToLinear())
    })

    document.querySelector('.button--colors.yellow')?.addEventListener('click', () => {
		changeColor(new Color(0xffffff).convertSRGBToLinear())
    })

    function changeColor(_colorToBeChanged: Color){
        drillMaterial.color = _colorToBeChanged;
        viewer.scene.setDirty()
    }
}


setupViewer()
