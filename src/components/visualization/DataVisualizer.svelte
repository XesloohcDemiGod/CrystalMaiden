<script lang="ts">
    import { onMount } from 'svelte';
    import { select } from 'd3-selection';
    import { scaleLinear, scaleTime } from 'd3-scale';
    import { line, area } from 'd3-shape';
    import { axisBottom, axisLeft } from 'd3-axis';
    import { zoom } from 'd3-zoom';

    export let data: any[];
    export let dimensions = { width: 800, height: 400, margin: 40 };

    let svg;
    let chartGroup;

    onMount(() => {
        svg = select('#visualization')
            .append('svg')
            .attr('width', dimensions.width)
            .attr('height', dimensions.height);

        chartGroup = svg.append('g')
            .attr('transform', `translate(${dimensions.margin}, ${dimensions.margin})`);

        const xScale = scaleTime()
            .domain([new Date(Math.min(...data.map(d => d.date))),
                    new Date(Math.max(...data.map(d => d.date)))])
            .range([0, dimensions.width - 2 * dimensions.margin]);

        const yScale = scaleLinear()
            .domain([0, Math.max(...data.map(d => d.value))])
            .range([dimensions.height - 2 * dimensions.margin, 0]);

        // Add zoom behavior
        const zoomBehavior = zoom()
            .scaleExtent([0.5, 5])
            .on('zoom', (event) => {
                chartGroup.attr('transform', event.transform);
            });

        svg.call(zoomBehavior);

        // Draw the visualization
        this.drawChart(chartGroup, xScale, yScale);
    });

    function drawChart(group, xScale, yScale) {
        // Add axes
        group.append('g')
            .attr('transform', `translate(0, ${dimensions.height - 2 * dimensions.margin})`)
            .call(axisBottom(xScale));

        group.append('g')
            .call(axisLeft(yScale));

        // Add line
        const lineGenerator = line()
            .x(d => xScale(new Date(d.date)))
            .y(d => yScale(d.value));

        group.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', lineGenerator)
            .attr('fill', 'none')
            .attr('stroke', '#4f46e5')
            .attr('stroke-width', 2);
    }
</script>

<div id="visualization" class="visualization-container">
    <!-- D3 visualization will be rendered here -->
</div>

<style>
    .visualization-container {
        width: 100%;
        height: 100%;
        background: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    } 