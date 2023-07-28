import * as THREE from 'three';
import {Color, LineSegments} from 'three';

export class ThreeJsUtil {
    /**
     * Creates a line between point1 and point2
     * @param point1 - start point
     * @param point2 - end point
     * @param color - color of the line
     */
    public static createLine(point1: THREE.Vector3, point2: THREE.Vector3, color: number | Color = 0xb2b2b2): THREE.Line {
        const points = [];
        points.push(point1);
        points.push(point2);
        const col = new Color(color);

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({color: col});
        return new THREE.Line(geometry, material);
    }

    /**
     * Create a cube with no areas, only edges.
     */
    public static createOutlineCube(width: number, height: number, depth: number): LineSegments {
        const g = new THREE.BoxGeometry(width, height, depth);
        const edges = new THREE.EdgesGeometry(g);
        const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0x000000}));
        line.position.set(width / 2 + 0.5, height / 2 + 0.5, depth / 2 - 0.5);
        return line;
    }


    /**
     * Create a basic cube.
     * @param scale
     * @param color
     * @param x - x position
     * @param y - y position
     * @param z - z position
     */
    public static createCube(scale: number, color: THREE.Color | Color | number, x: number, y: number, z: number): THREE.Mesh {
        const geometry = new THREE.BoxGeometry(scale, scale, scale);
        const material = new THREE.MeshStandardMaterial({color});
        const cube = new THREE.Mesh(geometry, material);

        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;

        return cube;
    }

    /**
     * @param baseWidth
     * @param content - label text
     * @param style - background color
     * @private
     */
    public static createHTMLCanvasLabel(baseWidth: number, fontSize: number, content: string, style: string = 'gray'): HTMLCanvasElement {
        const borderSize = 2;
        const ctx = document.createElement('canvas').getContext('2d');
        const font = `${fontSize}px bold sans-serif`;
        ctx.font = font;
        // measure how long the content will be
        const textWidth = ctx.measureText(content).width;

        const doubleBorderSize = borderSize * 2;
        const width = baseWidth + doubleBorderSize;
        const height = fontSize + doubleBorderSize;
        ctx.canvas.width = width;
        ctx.canvas.height = height;

        // need to set font again after resizing canvas
        ctx.font = font;
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';

        ctx.fillStyle = style;
        ctx.fillRect(0, 0, width, height);

        // scale to fit but don't stretch
        const scaleFactor = Math.min(1, baseWidth / textWidth);
        ctx.translate(width / 2, height / 2);
        ctx.scale(scaleFactor, 1);
        ctx.fillStyle = 'white';
        ctx.fillText(content, 0, 0);

        return ctx.canvas;
    }
}
